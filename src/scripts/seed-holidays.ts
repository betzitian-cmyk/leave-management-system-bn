import { getRepository } from 'typeorm';
import { Holiday } from '../models';
import { initializeDatabase } from '../config/database';

async function seedHolidays() {
  try {
    //await initializeDatabase();
    const holidayRepository = getRepository(Holiday);

    // Check if holidays already exist
    const count = await holidayRepository.count();
    if (count > 0) {
      console.log('Holidays already exist. Skipping seed.');
      process.exit(0);
      return;
    }

    // Default holidays for 2025
    const defaultHolidays = [
      { name: "New Year's Day", date: new Date('2025-01-01'), recurring: true },
      { name: 'Martin Luther King Jr. Day', date: new Date('2025-01-20'), recurring: true },
      { name: 'Memorial Day', date: new Date('2025-05-26'), recurring: true },
      { name: 'Independence Day', date: new Date('2025-07-04'), recurring: true },
      { name: 'Labor Day', date: new Date('2025-09-01'), recurring: true },
      { name: 'Thanksgiving Day', date: new Date('2025-11-27'), recurring: true },
      { name: 'Day after Thanksgiving', date: new Date('2025-11-28'), recurring: true },
      { name: 'Christmas Eve', date: new Date('2025-12-24'), recurring: true },
      { name: 'Christmas Day', date: new Date('2025-12-25'), recurring: true },
      { name: "New Year's Eve", date: new Date('2025-12-31'), recurring: true },
    ];

    for (const holiday of defaultHolidays) {
      const newHoliday = holidayRepository.create({
        name: holiday.name,
        date: holiday.date,
        recurring: holiday.recurring,
        active: true,
        description: `Official holiday: ${holiday.name}`,
      });
      await holidayRepository.save(newHoliday);
    }

    console.log('✅ Holidays seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding holidays:', error);
    process.exit(1);
  }
}

seedHolidays();
