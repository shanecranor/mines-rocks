/*
 * Author: Jennings Zhang
 * Date: 2019 February 2019
 * Purpose: this script demonstrates how to interact with Northeastern University's new Banner (nubanner) API.
 */

import rp from 'request-promise-native';
import tough from 'tough-cookie';

const SUBJECT = 'CS';
const COURSE_NUMBER = '2500';

const termOptions = {
    method: 'GET',
    uri: 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/classSearch/getTerms',
    qs: {
        searchTerm: '',
        offset: 1,
        max: 10 // change max if you want
    },
    json: true,
    resolveWithFullResponse: true
};

// null represents values that we will fill in later

let postOptions = {
    method: 'POST',
    uri: 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/term/search',
    qs: {
        mode: 'search'
    },
    form: {
        term: null,
        studyPath: '',
        studyPathText: '',
        startDatepicker: '',
        endDatepicker: '',
    },
    jar: null
};

let searchOptions = {
    method: 'GET',
    uri: 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/searchResults/searchResults',
    qs: {
        txt_subject: SUBJECT,
        txt_courseNumber: COURSE_NUMBER,
        txt_term: null,
        startDatepicker: '',
        endDatepicker: '',
        pageOffset: '0',
        pageMaxSize: '10',
        sortColumn: 'subjectDescription',
        sortDirection: 'asc'
    },
    jar: null,
    json: true
};

rp(termOptions).then(response => {

    // set term
    // returns an array, one of the elements is {"code":"201930","description":"Spring 2019 Semester"}
    // if using this code to scrape, you'd probably want to iterate over every term returned instead
    const TERM_CODE = '201930';
    postOptions.form.term = TERM_CODE;
    searchOptions.qs.txt_term = TERM_CODE;

    // set cookies
    const cookiejar = rp.jar();
    response.headers['set-cookie'].forEach(cookie =>
        cookiejar.setCookie(cookie, 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/'));
    postOptions.jar = cookiejar;
    searchOptions.jar = cookiejar;


    // POSTing tells the server to let us search for courses under this term
    rp(postOptions).then(response => {
        // just assume it worked
        rp(searchOptions).then(response => {
            // resolved! :D
            response['ztcEncodedImage'] = null; // it's base64 gibberish
            response['searchResultsConfigs'] = null; // don't care about that
            console.log(JSON.stringify(response));
        });
    });
});
