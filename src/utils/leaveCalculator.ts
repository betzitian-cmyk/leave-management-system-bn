export class LeaveCalculator {
  /**
   * Calculate business days between two dates, excluding weekends and holidays
   */
  calculateBusinessDays(startDate: Date, endDate: Date, holidays: Date[] = []): number {
    // Convert holiday strings to Date objects if needed
    const holidayDates = holidays.map((h) => (h instanceof Date ? h : new Date(h)));

    // Handle dates in the same day
    if (startDate.getTime() === endDate.getTime()) {
      const dayOfWeek = startDate.getDay();
      // If it's weekend, return 0
      if (dayOfWeek === 0 || dayOfWeek === 6) return 0;
      // If it's a holiday, return 0
      if (this.isHoliday(startDate, holidayDates)) return 0;
      return 1;
    }

    let count = 0;
    const currentDate = new Date(startDate);

    // Loop through each day
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Check if it's not a holiday
        if (!this.isHoliday(currentDate, holidayDates)) {
          count++;
        }
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }

  /**
   * Check if a date is a holiday
   */
  private isHoliday(date: Date, holidays: Date[]): boolean {
    return holidays.some(
      (holiday) =>
        date.getFullYear() === holiday.getFullYear() &&
        date.getMonth() === holiday.getMonth() &&
        date.getDate() === holiday.getDate(),
    );
  }
}
