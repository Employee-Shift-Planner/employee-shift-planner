const config = {
  api: {
    baseUrl: 'https://employeeschedulerapi.azurewebsites.net/api',
    //baseUrl: 'http://localhost:5113/api',
    endpoints: {
      employees: '/Employee',
      positions: '/position',
      schedule: "/Schedule",
      register: '/auth/register',
      availability: '/Availability',
      reports: '/Reports/weekly',
      notificationPreferences: '/NotificationPreferences'
      // Add more endpoints as needed
    }
  }
};

export default config;
