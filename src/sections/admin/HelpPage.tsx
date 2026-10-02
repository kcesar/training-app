import * as React from 'react';
import { Alert, Box, Container, Divider, Link as MuiLink, List, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import MainChrome from '../../components/MainChrome';

// User manual for training administrators and course leads.
// Keep this in step with the rules in server/api/trainingApi.ts and server/api/adminApi.ts.

const SECTIONS = [
  { id: 'access', title: 'Who can use the admin pages' },
  { id: 'layout', title: 'Finding your way around' },
  { id: 'settings', title: 'Course settings' },
  { id: 'sessions', title: 'Scheduling sessions' },
  { id: 'registration', title: 'How trainees register' },
  { id: 'waitlist', title: 'The wait list' },
  { id: 'on-behalf', title: 'Acting on behalf of a trainee' },
  { id: 'rosters', title: 'Rosters and marking completion' },
  { id: 'season', title: 'Starting a new training season' },
  { id: 'limits', title: "What the site doesn't do" },
  { id: 'quick', title: 'Quick reference' },
];

const Section = (props: { id: string, children: React.ReactNode }) => {
  const title = SECTIONS.find(s => s.id === props.id)!.title;
  return (
    <Box component="section" id={props.id} sx={{ scrollMarginTop: '80px', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>{title}</Typography>
      {props.children}
    </Box>
  );
};

const P = (props: { children: React.ReactNode }) => <Typography paragraph>{props.children}</Typography>;
const H = (props: { children: React.ReactNode }) => <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1 }}>{props.children}</Typography>;
// On-screen labels, so readers can match the text to the button
const UI = (props: { children: React.ReactNode }) => <Box component="strong" sx={{ whiteSpace: 'nowrap' }}>{props.children}</Box>;

const Bullets = (props: { items: React.ReactNode[] }) => (
  <List dense disablePadding sx={{ listStyleType: 'disc', pl: 3, mb: 2 }}>
    {props.items.map((item, i) => (
      <ListItem key={i} sx={{ display: 'list-item', py: 0.25 }} disableGutters>
        <ListItemText primary={item} primaryTypographyProps={{ component: 'div' }} />
      </ListItem>
    ))}
  </List>
);

const jumpTo = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const HelpPage = () => (
  <MainChrome>
    <Container maxWidth="md" sx={{ pb: 6 }}>
      <Box sx={{ m: 1 }}><Link to="/admin">Admin</Link> &gt; Help</Box>
      <Typography variant="h4" component="h1" sx={{ mt: 2 }}>Training Admin Manual</Typography>
      <Typography color="text.secondary" paragraph>
        For training administrators and course leads. It explains how to use this site and the rules it enforces for
        trainees, especially around registering, leaving and the wait list.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Contents</Typography>
        <Box component="ol" sx={{ m: 0, pl: 3 }}>
          {SECTIONS.map(s => (
            <li key={s.id}><MuiLink href={`#${s.id}`} onClick={jumpTo(s.id)}>{s.title}</MuiLink></li>
          ))}
        </Box>
      </Paper>

      <Section id="access">
        <P>Everyone signs in with their KCESAR Google account. What you see depends on where your account sits in Google Workspace:</P>
        <Bullets items={[
          <>Accounts in the <UI>Trainees</UI> organizational unit see the trainee view: their own courses and sessions.</>,
          <>Every other KCESAR account sees these admin pages, with full admin access. There's no separate admin role or list.</>,
        ]} />
        <P>
          Your role is decided when you sign in. If someone moves into or out of the Trainees unit, they need to sign out and
          back in before the change takes effect. New trainee accounts can take a few minutes to appear, because the site
          refreshes its copy of the Google directory every 5 minutes.
        </P>
      </Section>

      <Section id="layout">
        <P>The admin home page has three parts:</P>
        <Bullets items={[
          <><UI>Trainee List</UI>: everyone in the Trainees unit. Pick a trainee to see their progress and act for them (see <MuiLink href="#on-behalf" onClick={jumpTo('on-behalf')}>Acting on behalf of a trainee</MuiLink>).</>,
          <><UI>Courses</UI>: each course with its scheduled session dates underneath. Pick a course to change its settings and manage its sessions.</>,
          <><UI>Help</UI>: this manual.</>,
          <><UI>Start New Training Season</UI>, at the bottom: clears out the season's data after graduation (see <MuiLink href="#season" onClick={jumpTo('season')}>Starting a new training season</MuiLink>).</>,
        ]} />
        <P>
          From a course page, pick a session to open its roster: who's registered, who's waiting, and the tools for
          sign-in sheets and marking completion.
        </P>
      </Section>

      <Section id="settings">
        <P>
          The panel at the top of each course page holds the course's settings. They decide how that course's sessions are
          scheduled and who may sign up.
        </P>

        <H>Overnight or in-town</H>
        <P>Use the <UI>Overnight</UI> / <UI>In-town</UI> switch to choose how sessions are timed:</P>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell><strong>Overnight</strong> (field weekends)</TableCell>
                <TableCell><strong>In-town</strong> (classroom, one day)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Settings</TableCell>
                <TableCell><UI>Start time</UI> and <UI>End time (next day)</UI></TableCell>
                <TableCell><UI>Hours</UI></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>When scheduling a session you pick</TableCell>
                <TableCell>The start date only</TableCell>
                <TableCell>The start date and time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>The session runs</TableCell>
                <TableCell>From the start time on that date to the end time the next day, every time, including over daylight saving changes</TableCell>
                <TableCell>For the course's hours from the chosen start</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <P>
          You never type a session's end time: it always comes from these settings. Changing them doesn't move sessions that
          are already scheduled. A session picks up the new times the next time someone edits and saves it.
        </P>

        <H>Prerequisites</H>
        <P>
          Add the courses a trainee must have completed before they can sign up for this one. A trainee who hasn't finished
          them sees the course marked as blocked, with a list of what's missing, and can't register or join the wait list.
          The site won't let you create a loop, such as Course C requiring Course I while Course I requires Course C.
        </P>
        <P>A course counts as completed when the trainee has been marked complete in a roster on this site (see <MuiLink href="#rosters" onClick={jumpTo('rosters')}>Rosters and marking completion</MuiLink>).</P>

        <H>Saving</H>
        <P>
          Click <UI>Save</UI> to apply your changes or <UI>Reset</UI> to discard them. While the panel has unsaved changes,
          adding or editing sessions is switched off, so sessions are always scheduled with saved settings.
        </P>
      </Section>

      <Section id="sessions">
        <P>Below the settings, the course page lists the course's sessions. Each shows its dates and a summary such as "28 of 30 registered · 2 spots open · 3 waiting".</P>

        <H>Adding a session</H>
        <P>
          Click <UI>Add Session</UI>, pick the start (date, or date and time for in-town courses), check the size, and click
          <UI> Add</UI>. The size starts as the size of the course's last scheduled session. New sessions get the location "TBD".
        </P>

        <H>Changing a session</H>
        <P>Click the pencil to change a session's start or size.</P>
        <Bullets items={[
          <><strong>Making it bigger</strong> fills the new spots from the wait list, in order, as soon as you save. The editor lists who will be moved before you save.</>,
          <><strong>Making it smaller</strong> than the number already registered is allowed, with a warning. Nobody is removed. The session just stays full until enough people leave.</>,
          <>Once anyone has been marked complete for a session, it can't be edited or removed.</>,
        ]} />

        <H>Removing a session</H>
        <P>Click the bin icon. The confirmation tells you how many registered and wait-listed trainees will be dropped. They are not notified, so let them know yourself.</P>
        <Alert severity="info" sx={{ mb: 2 }}>
          Sessions where anyone has been marked complete can't be removed. Those completions are what let trainees register
          for later courses, so the sessions stay until the season is reset after graduation.
        </Alert>
        <P>
          If a session was marked complete by mistake, open its roster, choose <UI>Update Completed</UI>, uncheck everyone and
          save. Once nobody is marked complete, the session can be edited or removed again.
        </P>
      </Section>

      <Section id="registration">
        <P>Trainees see each course with its upcoming sessions, how full each one is, and a button. These rules apply to trainees signing themselves up:</P>
        <Bullets items={[
          <><strong>Prerequisites first.</strong> They can't register or join a wait list until the course's prerequisites are complete.</>,
          <><strong>One upcoming session per course.</strong> Once they're registered or on the wait list for one upcoming session of a course, they can't sign up for another session of the same course. They can leave and pick a different one.</>,
          <><strong>Not after completing.</strong> Once a trainee is marked complete for a course, they can't sign up for it again.</>,
          <><strong>Only before it starts.</strong> Registering and leaving are only possible until the session's start time.</>,
          <><strong>Open spots go to the wait list first.</strong> <UI>Register</UI> only appears when there's an open spot <em>and</em> nobody is waiting. Otherwise the button is <UI>Join Wait List</UI>.</>,
          <><strong>Leaving.</strong> A registered trainee can click <UI>Leave</UI> to give up their spot.</>,
        ]} />
      </Section>

      <Section id="waitlist">
        <H>Joining</H>
        <P>
          When a session is full, or has people waiting, trainees see <UI>Join Wait List</UI>. Before confirming, they're told
          their place in line. New people always join at the end, including when a spot has just opened but others are
          already waiting. If a trainee asks to join the wait list just as a spot opens and nobody else is waiting, they're
          simply registered.
        </P>

        <H>Waiting</H>
        <P>
          While waiting, a trainee sees "You're #2 on the wait list" and can click <UI>Leave Wait List</UI>. Their place counts
          as their one upcoming session for that course.
        </P>

        <H>When a spot opens</H>
        <Alert severity="info" sx={{ mb: 2 }}>
          Nobody moves off the wait list automatically. When someone leaves, the spot stays open until an admin fills it, and
          new trainees still can't take it while anyone is waiting.
        </Alert>
        <P>There are two ways to move people into the class:</P>
        <Bullets items={[
          <><strong>From the session's roster:</strong> the <UI>Wait list</UI> section shows everyone waiting, in order. Click <UI>Add to class</UI> to move someone into an open spot. If the class is full, the button reads <UI>Add (overflow)</UI>: it adds them anyway, over the session's size, without changing the size. You can pick anyone on the list, not just #1.</>,
          <><strong>By making the session bigger</strong> on the course page, which fills the new spots from the top of the wait list when you save.</>,
        ]} />
        <P>Trainees aren't notified when they're moved into a class. They'll see it on their page next time they look, so you may want to tell them.</P>
      </Section>

      <Section id="on-behalf">
        <P>
          Open <UI>Trainee List</UI> and pick a trainee to see their page as they see it. You can register them, take them out of
          a session or the wait list, and see their progress. As an admin you can do some things they can't:
        </P>
        <Bullets items={[
          <>Register them into a session that's full or has a wait list. Admins always see <UI>Register</UI>, and it puts the trainee straight into the class. If the class is full they're added as overflow, over the session's size, and the size doesn't change.</>,
          <>Register them even if their prerequisites aren't complete.</>,
        ]} />
        <P>Some rules still apply:</P>
        <Bullets items={[
          <>One upcoming session per course: take them out of their current session first.</>,
          <>No registering for a course they've already completed.</>,
          <>No signing up for or leaving sessions that have already started.</>,
          <>You can't put someone on the wait list for them. To add someone ahead of the line, register them directly.</>,
        ]} />
      </Section>

      <Section id="rosters">
        <P>Pick a session on a course page to open its roster. The top shows the session's full dates and times and how full it is. The class list only includes people in the class, not the wait list.</P>
        <Bullets items={[
          <><UI>Spreadsheet</UI>: downloads the class as a CSV (name, email, phone).</>,
          <><UI>PDF Roster</UI>: a printable check-in sheet with names and phone numbers.</>,
          <><UI>Copy Emails</UI>: copies the class's email addresses, ready to paste into an email. Once completions are recorded it becomes <UI>Copy Completed Emails</UI> and copies only those who completed.</>,
        ]} />

        <H>Marking completion</H>
        <P>
          <UI>Update Completed</UI> becomes available once the session has started. The first time, everyone in the class
          starts out checked, so uncheck anyone who didn't complete and click <UI>Save</UI>. Completed trainees get a check mark,
          and the course shows as complete on their page with the session's end date.
        </P>
        <P>
          Completions here are what unlock later courses' prerequisites. D4H remains the official training record, so
          enter rosters there as usual.
        </P>
      </Section>

      <Section id="season">
        <P>
          After graduation, use <UI>Start New Training Season</UI> at the bottom of the admin home page to clear the way for the
          next class. It permanently removes:
        </P>
        <Bullets items={[
          <>every session, for every course</>,
          <>every registration and wait list place</>,
          <>every completion record</>,
        ]} />
        <P>
          Course settings (times, hours and prerequisites) are kept, and trainee accounts aren't affected. The confirmation
          shows how much will be removed, and you have to type <UI>remove data and start new season</UI> before it will go ahead.
        </P>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Afterwards nobody has credit for any course on this site, so returning trainees will be blocked by prerequisites
          until they complete courses again or an admin registers them. Make sure every roster is in D4H first. This can't be undone.
        </Alert>
      </Section>

      <Section id="limits">
        <Bullets items={[
          <>It doesn't send any email or notifications: not when someone is moved off the wait list, dropped from a removed session, or registered by an admin.</>,
          <>It doesn't move people off the wait list on its own.</>,
          <>It doesn't update D4H, or read completions from it.</>,
          <>It can't change a session's location yet. New sessions show "TBD".</>,
          <>Times are shown in your device's time zone.</>,
        ]} />
      </Section>

      <Section id="quick">
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>I want to…</strong></TableCell>
                <TableCell><strong>Do this</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Schedule a new session', 'Course page → Add Session'],
                ['Change when a session starts, or its size', 'Course page → pencil on the session'],
                ['Change a course\'s times, hours or prerequisites', 'Course page → settings panel at the top → Save'],
                ['Move someone off the wait list', 'Session roster → Wait list → Add to class'],
                ['Add someone to a full class', 'Session roster → Add (overflow), or register them from their trainee page. The size stays the same.'],
                ['Sign a trainee up, or take them out', 'Trainee List → trainee → course → Register / Leave'],
                ['Print a sign-in sheet', 'Session roster → PDF Roster'],
                ['Email the class', 'Session roster → Copy Emails'],
                ['Record who completed', 'Session roster → Update Completed (after the session starts) → Save'],
                ['Cancel a session', 'Course page → bin icon on the session (not possible once anyone has completed)'],
                ['Clear everything for next year', 'Admin home → Start New Training Season (after graduation)'],
              ].map(([want, how]) => (
                <TableRow key={want}>
                  <TableCell>{want}</TableCell>
                  <TableCell>{how}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary">Questions or problems with the site? Contact the training app maintainer.</Typography>
      </Section>
    </Container>
  </MainChrome>
);

export default HelpPage;
