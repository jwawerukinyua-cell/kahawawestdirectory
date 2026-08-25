import { OpeningHours } from '../types';

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: '08:00', close: '20:00', isClosed: false },
  tuesday: { open: '08:00', close: '20:00', isClosed: false },
  wednesday: { open: '08:00', close: '20:00', isClosed: false },
  thursday: { open: '08:00', close: '20:00', isClosed: false },
  friday: { open: '08:00', close: '21:00', isClosed: false },
  saturday: { open: '08:00', close: '21:00', isClosed: false },
  sunday: { open: '10:00', close: '18:00', isClosed: false },
};

export const TWENTY_FOUR_SEVEN_HOURS: OpeningHours = {
  monday: { open: '00:00', close: '23:59', isClosed: false },
  tuesday: { open: '00:00', close: '23:59', isClosed: false },
  wednesday: { open: '00:00', close: '23:59', isClosed: false },
  thursday: { open: '00:00', close: '23:59', isClosed: false },
  friday: { open: '00:00', close: '23:59', isClosed: false },
  saturday: { open: '00:00', close: '23:59', isClosed: false },
  sunday: { open: '00:00', close: '23:59', isClosed: false },
};

export const FUNDI_HOURS: OpeningHours = {
  monday: { open: '07:30', close: '18:30', isClosed: false },
  tuesday: { open: '07:30', close: '18:30', isClosed: false },
  wednesday: { open: '07:30', close: '18:30', isClosed: false },
  thursday: { open: '07:30', close: '18:30', isClosed: false },
  friday: { open: '07:30', close: '18:30', isClosed: false },
  saturday: { open: '08:00', close: '17:00', isClosed: false },
  sunday: { open: '09:00', close: '15:00', isClosed: true },
};
