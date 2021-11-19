const { tagExistence } = require('../src/index.js')

describe('Tag existence tests', function() {
    it('should output tags found for element', function() {
        // Arrange
        const elements = [{
            'element': 'script',
            'integrity': 'malformed integrity',
            'cross_origin': 'malformed cross-origin'
        }]

        // Act
        tagExistence(elements)
        .then(function(res) {
            // Assert
            assert.deepEqual(res, [{'integrity': true, 'cross_origin': true}])
        })
    }),

    it('should output no tags found for element', function() {
        // Arrange
        const elements = [{
            'element': 'script',
            'integrity': '',
            'cross_origin': ''
        }]

        // Act
        tagExistence(elements)
        .then(function(res) {
            // Assert
            assert.deepEqual(res, [{'integrity': false, 'cross_origin': false}])
        })
    })
})
