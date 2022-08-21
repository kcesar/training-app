import { sequelize } from "./db/dbBuilder";
import "./db/dbRepo";
import { OfferingRow } from "./db/offeringRow";

async function run() {
  if (!process.env.DB_HOST) await sequelize.sync({force: true});

  OfferingRow.bulkCreate([
    { courseId: 'course-b', 'startAt': '2022-09-10T09:00', 'doneAt': '2022-09-10T18:00', capacity: 30, location:'TBD' },
    { courseId: 'course-b', 'startAt': '2022-09-18T09:00', 'doneAt': '2022-09-18T18:00', capacity: 30, location:'TBD' },
    { courseId: 'course-b', 'startAt': '2022-10-02T09:00', 'doneAt': '2022-10-02T18:00', capacity: 30, location:'TBD' },
    { courseId: 'course-b', 'startAt': '2022-10-15T09:00', 'doneAt': '2022-10-15T18:00', capacity: 30, location:'TBD' },
    { courseId: 'course-c', 'startAt': '2022-10-29T06:30', 'doneAt': '2022-10-30T16:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-c', 'startAt': '2022-11-05T06:30', 'doneAt': '2022-11-06T16:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-c', 'startAt': '2022-11-19T06:30', 'doneAt': '2022-11-20T16:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-c', 'startAt': '2022-12-03T06:30', 'doneAt': '2022-12-04T16:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'fa-intro', 'startAt': '2022-11-12T08:00', 'doneAt': '2022-11-12T17:00', capacity: 30, location:'TBD' },
    { courseId: 'fa-intro', 'startAt': '2022-12-10T08:00', 'doneAt': '2022-12-10T17:00', capacity: 30, location:'TBD' },
    { courseId: 'fa-intro', 'startAt': '2023-01-14T08:00', 'doneAt': '2023-01-14T17:00', capacity: 30, location:'TBD' },
    { courseId: 'course-1', 'startAt': '2022-11-19T06:20', 'doneAt': '2022-11-20T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-1', 'startAt': '2022-12-03T06:20', 'doneAt': '2022-12-04T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-1', 'startAt': '2022-12-17T06:20', 'doneAt': '2022-12-18T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-1', 'startAt': '2023-01-07T06:20', 'doneAt': '2023-01-08T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-2', 'startAt': '2022-12-17T07:00', 'doneAt': '2022-12-18T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-2', 'startAt': '2023-01-07T07:00', 'doneAt': '2023-01-08T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-2', 'startAt': '2023-01-21T07:00', 'doneAt': '2023-01-22T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'course-2', 'startAt': '2023-02-04T07:00', 'doneAt': '2023-02-05T15:00', capacity: 30, location:'Camp Edward' },
    { courseId: 'fa-searcher', 'startAt': '2023-01-15T09:00', 'doneAt': '2023-01-15T18:00', capacity: 30, location: 'TBD'},
    { courseId: 'fa-searcher', 'startAt': '2023-01-28T09:00', 'doneAt': '2023-01-28T18:00', capacity: 30, location: 'TBD'},
    { courseId: 'fa-searcher', 'startAt': '2023-02-11T09:00', 'doneAt': '2023-02-11T18:00', capacity: 30, location: 'TBD'},
    { courseId: 'fa-searcher', 'startAt': '2023-02-18T09:00', 'doneAt': '2023-02-18T18:00', capacity: 30, location: 'TBD'},
    { courseId: 'course-3', 'startAt': '2023-02-25T07:00', 'doneAt': '2023-02-26T15:00', capacity: 30, location: 'TBD'},
    { courseId: 'course-3', 'startAt': '2023-03-11T07:00', 'doneAt': '2023-03-12T15:00', capacity: 30, location: 'TBD'},
    { courseId: 'course-3', 'startAt': '2023-03-25T07:00', 'doneAt': '2023-03-26T15:00', capacity: 30, location: 'TBD'},
  ])
}
run();