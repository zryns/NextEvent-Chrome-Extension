// jest.setup.js
global.chrome = {
  runtime: {
    onStartup: {
      addListener: jest.fn(),
    },
  },
  alarms: {
    create: jest.fn(), // Mock the create method
  },
};
