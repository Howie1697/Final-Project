// Get Quotes 
let getQuote = () => {
    var $xhr = $.getJSON('https://quote-garden.herokuapp.com/api/v3/quotes');
    console.log('clicked');
    $xhr.done(function (data) {
        if ($xhr.status !== 200) {
            return;
        }
        const $quoteBoard = $('.quote-board');
        $quoteBoard.empty();
        for (let i = 0; i < 10; i++) {
            let key = i;
            let quoteLetters = data.data[i].quoteText;
            let quoteAuthor = data.data[i].quoteAuthor;
            const $li = $('<li>').attr('data-quote-id', key).text(`"${quoteLetters}" - ${quoteAuthor}`);
            $quoteBoard.append($li);

            console.log(quoteAuthor)
            console.log(quoteLetters)
            console.log($li)
        }
    })
}
$('#grabQuote').click(getQuote)
console.log(getQuote)
//create
const inspirationalQuotes = firebase.database().ref('quotes');
$('#inspiration-form').on('submit', function (event) {
    event.preventDefault();
    const quoteText = $('#Quote').val();
    if (quoteText.trim() !== '') {
        // Add qoute to Database
        inspirationalQuotes.push({
            quote: quoteText.trim(),
            votes: 0,
        });
        $('#Quote').val('');
    }
})
// Read
inspirationalQuotes.on('value', function (results) {
    const $savedQuotes = $('.saved-quotes');
    $savedQuotes.empty();
    const list = [];
    results.forEach(function (result) {
        const { quote, votes } = result.val();
        const key = result.key;
        list.push({
            quote: quote,
            votes: votes,
            key: key
        });
    });
    list.sort(function (a, b) {
        return b.votes - a.votes;
    });
    list.forEach(function (result) {
        const { key, quote, votes } = result;
        // const quote = result.val().quote;
        // const votes = result.val().votes;
        // const key = result.key;
        const $li = $('<li>').attr('data-quote-id', key).text(quote);
        const $right = $('<div>').addClass('right').text('Votes: ' + votes);
        const $upvote = $('<a>').attr('href', '#').addClass('upvote').text('+');
        const $downvote = $('<a>').attr('href', '#').addClass('downvote').text('-');
        const $remove = $('<a>').attr('href', '#').addClass('remove').text('remove');
        $right.prepend($downvote);
        $right.append($upvote);
        $right.append($remove);
        $li.append($right);
        $savedQuotes.append($li);
    })
})
// Update
$('.saved-quotes').on('click', 'a.upvote', function (event) {
    event.preventDefault();
    const key = $(event.target).closest('li').attr('data-quote-id');
    const quoteVotes = inspirationalQuotes.child(key).child('votes');
    quoteVotes.transaction(function (votes) {
        return votes + 1;
    });
})
$('.saved-quotes').on('click', 'a.downvote', function (event) {
    event.preventDefault();
    const key = $(event.target).closest('li').attr('data-quote-id');
    const quoteVotes = inspirationalQuotes.child(key).child('votes');
    quoteVotes.transaction(function (votes) {
        if (votes === 0) {
            return votes;
        }
        return votes - 1;
    });
})
// Delete
$('.saved-quotes').on('click', 'a.remove', function (event) {
    event.preventDefault();
    const key = $(event.target).closest('li').attr('data-quote-id');
    const quoteQuest = inspirationalQuotes.child(key);
    quoteQuest.remove();
});