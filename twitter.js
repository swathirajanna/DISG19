var Twitter = require('node-tweet-stream')
  , t = new Twitter({
    consumer_key: 'FiYMUZ7adXfqrYtr3ByvInz3y',
    consumer_secret: 'w3whc6mzUuLXcbx9pKxhKyVAbT5RBuGAFwMlUYqE2xP4gyed5l',
    token: '541602246-MGz05eKQs11xIh92wzbn63hjDmZ1X5QUhx569z06',
    token_secret: 'sqUY0cAo9AoNqtgiSLrcSEjGTfxgOlqoCpia1pGRJ0zVQ'
  })
 
t.on('tweet', function (tweet) {
  console.log('tweet received', tweet)
})
 
t.on('error', function (err) {
  console.log('Oh no')
})
 
t.track('nodejs')
t.track('pizza')
 
// 5 minutes later
t.track('tacos')
 
// 10 minutes later
t.untrack('pizza')
