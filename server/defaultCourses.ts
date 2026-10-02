import { CourseModel } from '../src/api-models/courseModel';

// Used until an admin saves changes to the course settings.
export const defaultCourses: CourseModel[] = [
  { id: 'course-b', title: 'Course B', summary: 'Indoor navigation course', hours: 9, prereqs: [] },
  { id: 'fa-intro', title: 'Intro to Searcher First Aid', summary: '', hours: 9, prereqs: ['course-b'] },
  { id: 'course-c', title: 'Course C', summary: 'Outdoor weekend - Intro to SAR', hours: 32.5, prereqs: ['fa-intro'], startTime: '06:30', endTime: '16:00' },
  { id: 'course-1', title: 'Course I', summary: 'Outdoor weekend - Navigation', hours: 31, prereqs: ['course-c'], startTime: '06:20', endTime: '15:00' },
  { id: 'fa-searcher', title: 'Searcher First Aid', summary: 'SAR specific first aid and scenarios', hours: 9, prereqs: ['course-c'] },
  { id: 'course-2', title: 'Course II', summary: 'Outdoor weekend - Evaluation', hours: 31, prereqs: ['course-1', 'fa-searcher'], startTime: '07:00', endTime: '15:00' },
  { id: 'course-3', title: 'Course III', summary: 'Outdoor weekend - mock mission', hours: 31, prereqs: ['course-2'], startTime: '07:00', endTime: '15:00' },
  { id: 'orientation', title: 'ESAR Ops Orientation', summary: 'Information for new graduates about responding to missions, etc.', hours: 3, prereqs: ['course-2'] },
];
