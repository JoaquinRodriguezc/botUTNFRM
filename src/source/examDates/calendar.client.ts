import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { calendar_v3, google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;

  constructor(private configService: ConfigService) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key:
          this.configService.getOrThrow<string>('GOOGLE_PRIVATE_KEY'),
        client_email: this.configService.getOrThrow<string>(
          'GOOGLE_CLIENT_EMAIL',
        ),
      },
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({
      version: 'v3',
      auth: auth,
    });
  }

  public getCalendar(): calendar_v3.Calendar {
    return this.calendar;
  }
  async getEvents() {
    const res = await this.calendar.events.list({
      calendarId: this.configService.getOrThrow<string>('GOOGLE_CALENDAR_ID'),
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    const events = res.data?.items;
    return events;
  }
}
