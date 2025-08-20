const mockOctokitRest = {
  pulls: {
    list: jest.fn(),
    listReviews: jest.fn(),
  },
};

class Octokit {
  constructor(config) {
    this.rest = mockOctokitRest;
  }
}

module.exports = {
  Octokit,
  rest: mockOctokitRest,
};
