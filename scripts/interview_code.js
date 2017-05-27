/*
/----------------------------------------------
/ Hey there, talkin to you, Nerd!
/ The coding interview... you are doing it wrong.
/  ````````````````````````````````````````````
/ ``````````````` INTERVIEW CODE ``````````````
/----------------------------------------------
*/
var hypothesis =
  "Coding in an interview is something a significant number of talented software developers will fail at because the test produces extra false negative and rare true positive results.  There is a better way.";

var experiment1 = {
  description: "The interview team conducts interviews of current employee developers (like you!) and assesses them with sample coding problems.",
  contexts: {
    whiteboard: "The developer demonstrates writing sample code while standing at the whiteboard.",
    text_editor: "The developer demonstrates writing sample code in notepad at the interview room computer.",
    in_IDE: "The developer demonstrates writing sample code in a familiar IDE but on the interview room computer while the interview team observes and comments on what they are doing, sometimes asking questions, then apologising for interrupting the train of thought followed by a long awkward silence.",
    in_their_own_IDE_at_their_own_desk: "The developer demonstrates writing sample code using their own tools including internet access and use of online documentation and forums."
  },
  results: {
    whiteboard: "91% of develpers failed the task while standing at the whiteboard.  The interview team noted expressions of discomfort, fatigue, confusion, panic.  This context produced the worst results of experiment 1.  One subject remarked that in all their years working here they had not needed to do this before and felt concerned if this was going to be something they needed to do regularly (looking at you, Sam).",
    text_editor: "66% of develpers failed the task while writing in notepad as the interviewers waited.",
    in_IDE: "33% of develpers failed the task while	working in a familiar IDE.  In a related experiment, 33% of bmx racers failed a 20 meter dash timed trial when using an unfamiliar bike that didn't fit them.",
    in_their_own_IDE_at_their_own_desk: "100% of developers succeeded in completing the task with their own tools including internet access and use of online documentation and forums."
  }
};

var alternative: {
  "Perform the technical assessment portion of the interview by discussing recent original sample code the developer brings to the interview as a portfolio of representative work."
};
var copyright: "@copyright 2017 Dan Ray"
var license: "MIT";
