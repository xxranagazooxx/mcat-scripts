# mcat-scripts
various scripts related to things mcat

## aamc\_hide\_username.js

Simple script to rewrite the username banner on AAMC MCAT interface.
It doesn't harm anything. Just a helper if you screenshot to share for question reference.
Submitting it will not change your name or anything like that. Doesn't have that much power.

## kaplan\_review\_hide\_answer.js

This is a helper script to hide the answers when reviewing a full-length exam.
Oftentimes, its helpful to hide the answer and re-answer the question as if
I'm seeing it for the first time. This forces you to get into the same mindset
and resolve why some mistake was made.
Unfortunately, can't do this out of the box. Kaplan highlights and shows strikethroughs
which sucks when trying to review.
This helps HUUUGE.

Caveat: Turn off this script when taking the test. It will hide answers/highlight 
if you navigate away from a question. The answers will be stored, but just not visible.

## kaplan\_review\_diag\_hacks.js

This is a base script. Since Kaplan doesn't provide nearly enough drilldowns
to deep dive and pinpoint what I can work on. This intercepts the data and 
as an example prints #of correct/incorrect in divs above the sections.

I have much bigger plans for this, including drill down charts and graphics.
A lot of things can be done here with enough time (and hope Kap doesn't change API/code).



