"use strict";

$(document).ready(function() {
    $(document).on("click", "#run-apply", function() {
        $.get('/run-apply', {}, function(response) {
            console.log(response);
        }, 'json');
    });
});