export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/generate',
      handler: 'controller.generate',
      config: {
        policies: [],
      },
    },
  ],
};
