'use strict';

module.exports = {
    test: test
};

function test(req, res) {
    var testData = {
      endpoint: 'You just called the /api/test endpoint!',
      output: 'It returns a JSON object for you to practice with!',
      name: 'Ali Shan Momin',
      image: 'http://cdn3-www.cattime.com/assets/uploads/2011/08/best-kitten-names-1.jpg',
      isBaylor: false,
      favoriteWord: 'Kappa'
    };
    return res.status(200).json(testData);
}
