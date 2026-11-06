import type { Room } from '@/utils/booking';

export const CURRENT_TIME = 9 * 60;

export const ROOMS: Room[] = [
  {
    id: 'tesla-lecture-hall',
    name: 'Tesla Lecture Hall',
    capacity: 50,
    equipment: ['Projector', 'Microphone'],
    isBlocked: false,
    bookings: [
      { id: 'tesla-1', title: 'Intro to Physics', start: 8 * 60 + 30, end: 10 * 60 },
      { id: 'tesla-2', title: 'Faculty Meeting', start: 13 * 60, end: 14 * 60 + 30 },
    ],
  },
  {
    id: 'turing-lab',
    name: 'Turing Lab',
    capacity: 24,
    equipment: ['Computers', 'Projector', 'Whiteboard'],
    isBlocked: false,
    bookings: [
      { id: 'turing-1', title: 'Data Structures Lab', start: 10 * 60, end: 12 * 60 },
      { id: 'turing-2', title: 'Office Hours', start: 14 * 60, end: 15 * 60 },
    ],
  },
  {
    id: 'ada-seminar-room',
    name: 'Ada Seminar Room',
    capacity: 12,
    equipment: ['Whiteboard', 'Video Conferencing'],
    isBlocked: false,
    bookings: [{ id: 'ada-1', title: 'Thesis Seminar', start: 11 * 60, end: 12 * 60 + 30 }],
  },
  {
    id: 'bohr-auditorium',
    name: 'Bohr Auditorium',
    capacity: 200,
    equipment: ['Projector', 'Microphone', 'Video Conferencing'],
    isBlocked: true,
    bookings: [{ id: 'bohr-1', title: 'Guest Lecture', start: 15 * 60, end: 16 * 60 }],
  },
];
