const { tagUsage } = require('../src/index.js')

describe('Tag usage tests', function() {
    const usageCases = [
        {
            tags: [{
                'element': 'script',
                'cross_origin': 'malformed cross-origin'
            }],
            expectedResult: [{
                integrity: false,
                cross_origin: true
            }]
        },
        {
            tags: [{
                'element': 'script',
                'cross_origin': 'malformed cross-origin'
            }],
            expectedResult: [{
                integrity: true,
                cross_origin: false
            }]
        },
        {
            tags: [{
                'element': 'script',
                'integrity': 'malformed integrity',
                'cross_origin': 'malformed cross-origin'
            }],
            expectedResult: [{
                integrity: true,
                cross_origin: true
            }]
        },
        {
            tags: [{
                'element': 'script',
                'integrity': '',
                'cross_origin': ''
            }],
            expectedResult: [{
                integrity: false,
                cross_origin: false
            }]
        }
    ]
    for (const usageCase in usageCases) {
        it('tests usage of integrity and cross origin tags', function() {
            // Act
            tagUsage(usageCase.elements)
            .then(function(res) {
                // Assert
                assert.deepEqual(res, [{'integrity': use, 'cross_origin': true}])
            })
        })
    }
})
