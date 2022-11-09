import { action, computed, makeObservable, observable, onBecomeObserved, runInAction } from 'mobx';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content } from 'pdfmake/interfaces';
import OfferingViewModel, { formatOfferingDates } from '../models/offeringViewModel';
import { format as formatDate } from 'date-fns';

import { SessionTask, TrainingTask } from '.';
import AdminStore from './adminStore';
import SignupViewModel, { signupToViewModel } from '../models/signupViewModel';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
const ROWS_PER_PDF_PAGE = 13;

export interface TaskProgress<T extends TrainingTask> {
  task: T,
  blockedBy: string[],
  completed?: Date,
  status: string,
  registrations: {[offeringId:string]: {
    status: 'registered'|'waiting',
    isPast?: boolean,
  }},
}

export type RegistrationAction = 'register'|'leave';

class CourseStore {
  private store: AdminStore;
  @observable courseId: string;
  @observable loadingSignups: boolean = false;
  @observable signups: SignupViewModel[] = [];

  @observable loadingCompleted: boolean = false;
  @observable completed: string[] = [];
  @observable completedOfferingId: string = '';
  @observable editingCompleted: boolean = false;
  @observable pendingCompleted: string[] = [];
  @observable savingCompleted: boolean = false;

  @observable snackText?: string;
  @observable snackOpen: boolean = false;
  @observable snackSeverity?: 'success'|'error'|'warning'|'info';
  @observable snackTime = 4000;

  constructor(store: AdminStore, courseId: string) {
    makeObservable(this);
    this.store = store;
    this.courseId = courseId;
    onBecomeObserved(this, 'signups', () => runInAction(() => this.loadSignups()));
  }

  @action.bound
  async loadSignups() {
    this.loadingSignups = true;
    const response = await fetch(`/api/admin/courses/${this.courseId}/signups`);
    const result = await response.json();
    runInAction(() => {
      this.signups = result.map(signupToViewModel);
      this.loadingSignups = false;
    })
  }

  @action.bound
  async loadCompleted(offeringId: string) {
    if (this.loadingCompleted || this.completedOfferingId === offeringId) return;
    this.loadingCompleted = true;

    const response = await fetch(`/api/admin/offerings/${offeringId}/completed`);
    const result = await response.json();
    runInAction(() => {
      this.completed = result.map((f: any) => f.traineeEmail);
      this.loadingCompleted = false;
    });
  }

  @action.bound
  editCompleted(offeringId: string): void {
    this.editingCompleted = true;
    this.pendingCompleted = [ ...(this.completed.length ? this.completed : this.getRoster(offeringId).map(r => r.traineeEmail)) ];
  }

  @action.bound
  setCompleted(traineeEmail: string, checked: boolean) {
    this.pendingCompleted = this.pendingCompleted.filter(f => f !== traineeEmail);
    if (checked) this.pendingCompleted.push(traineeEmail);
  }

  @action.bound
  async finishCompleted(offeringId?: string) {
    try {
      if (offeringId) {
        this.savingCompleted = true;
        try {
          const response = await fetch(`/api/admin/offerings/${offeringId}/completed`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ list: this.pendingCompleted })
          });
          if (!response.ok) throw new Error("Failed to save");
          
          this.completed = [ ...this.pendingCompleted ];
        } finally {
          this.savingCompleted = false;
        }
      }
      this.editingCompleted = false;
    } catch (error) {
      alert('Error: ' + error);
    }
  }

  @computed
  get computedWorking() {
    return this.loadingCompleted || this.savingCompleted;
  }

  @computed
  get copyEmailsText() {
    return this.completed.length ? 'Copy Completed Emails' : 'Copy Emails';
  }

  @action.bound
  async emailsToClipboard(roster: SignupViewModel[]) {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      const action = async (emails: string[], message: string) => {
        await navigator.clipboard.writeText(emails.join('; '));
        this.showSnackBar(message, 'success');
      }

      if (this.completed.length) {
        action(this.completed, 'Emails of trainees that completed this course were copied to the clipboard');
      } else {
        action(roster.map(f => f.traineeEmail), 'Emails of all registered trainees were copied to the clipboard');
      }
    } else {
      this.showSnackBar('Cannot copy data to clipboard', 'error');
    }
  }

  @action.bound
  showSnackBar(message: string, severity?: 'error'|'warning'|'info'|'success') {
    this.snackText = message;
    this.snackSeverity = severity;
    this.snackOpen = true;
  }

  @action.bound
  clearSnackText() {
    this.snackOpen = false;
  }

  @action.bound
  generateCSV(roster: SignupViewModel[]) {
    let rows = roster.map((s) => [
      s.traineeName,
      s.traineeEmail,
      s.traineePhone
    ].map(t => t ? `"${t}"` : ''));
    rows.unshift(['Name','Email','Phone']);

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `roster-${this.course?.id}.csv`);
    link.click()
    URL.revokeObjectURL(link.href)
  }

  @action.bound
  generatePDF(roster: SignupViewModel[], course: SessionTask, offering: OfferingViewModel) {
    
    let content: Content[] = [];
    for (let i=0; i<Math.ceil(roster.length / ROWS_PER_PDF_PAGE); i++) {
      content.push(this.generateRosterPage(roster, i, course, offering));
    }

    pdfMake.createPdf({
      pageOrientation: 'landscape',
      content,
    }).download(`roster-${this.course?.id}.pdf`);
  }

  private generateRosterPage(roster: SignupViewModel[], pageNum: number, course: SessionTask, offering: OfferingViewModel) :Content {
    let body = [
      [
        {text: 'CHECK-IN LIST', style: 'tableHeader', colSpan: 4, bold: true }, {}, {}, {},
        {
          table: {
            body: [
              [{text: '1.Incident Name:', fontSize: 8}, {text: course.title, fontSize: 12}],
            ]},
            layout: 'noBorders',
          style: 'tableHeader',
          colSpan: 3
        }, {}, {},
        {
          table: {
            body: [
              [{text: '2.Operational Period:', fontSize: 8}, {text: formatOfferingDates(offering), fontSize: 12}],
            ]},
            layout: 'noBorders',
          style: 'tableHeader',
          colSpan: 5
        }, {}, {}, {}, {},
      ],
      [
        {text: '3. TEAM/UNIT NAME:', style: 'tableHeader', colSpan: 6, fontSize: 10}, {}, {}, {}, {}, {},
        {text: '4. CHECK-IN LOCATION:', style: 'tableHeader', colSpan: 6, fontSize: 10}, {}, {}, {}, {}, {},
      ],
      [
        {}, ...[5,6,7,8,9,10,11,12,13,14,15].map(i => ({text: i+'.', alignment: 'center', fontSize: 9})),
      ],
      [
        {},
        ...['DEM #', 'UNIT', 'Team', 'PRINT NAME', 'CELL PHONE', 'Left Home', 'Arrive Scene','Depart Scene','Arrive Home', 'Miles']
          .map(t => ({ text: t, alignment: 'center'})),
        {},
      ],
    ];

    for (let i=0; i<ROWS_PER_PDF_PAGE; i++) {
      body.push([
        {text: ((i + 1) + ''), alignment: 'center', fontSize: 8},
        {}, //DEM
        {}, //Unit
        {}, //Team
        { text: roster[pageNum * ROWS_PER_PDF_PAGE + i]?.traineeName },
        { text: roster[pageNum * ROWS_PER_PDF_PAGE + i]?.traineePhone },
        {}, // Left
        {}, // Arrive
        {}, // Depart
        {}, // Home
        {}, // Miles
        {}, // Claim
      ])
    }

    body.push([
      {
        table: {
          body: [
            [{text: 'PREPARED BY', fontSize: 11}, {text: `Name: ${this.store.adminName}` /*`Name: ${formatDate(new Date(), 'MMM')}`*/, fontSize: 10, margin: [10,2,0,0]}],
          ]
        },
        margin: [0, 6, 0, 0],
        layout: 'noBorders',
        colSpan: 12
      }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
    ]);
    body.push([
      {text: 'ICS 111-SAR', bold: true, colSpan: 5}, {}, {}, {}, {},
      {text: `Date/Time: ${formatDate(new Date(), 'E yyyy-MM-dd h:mmaaa')}`, fontSize: 11, colSpan: 7}, {}, {}, {}, {}, {}, {},
    ]);

    let content: Content = {
      table: {
        headerRows: 4,
        widths: [ 5, 40, 40, 50, 100, 80, 60, 60, 60, 60, 60, 20 ],
        heights: [ 20, 20, 10, 30, ...Array(ROWS_PER_PDF_PAGE).fill(22), 20, 15 ],
        body,
      },
    };
    return content;
  }

  @computed
  get course() {
    const c = this.store.courseList.find(f => f.id === this.courseId);
    if (!c) return undefined;
    return {
      ...c,
      offerings: this.store.offerings[this.courseId],
      signups: this.signups
    };
  }

  getRoster(offeringId: string) {
    return this.course?.signups?.filter(s => s.offeringId === offeringId) ?? [];
  }
}

export default CourseStore;