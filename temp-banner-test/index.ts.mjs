const SUBJECT = 'CS';
const COURSE_NUMBER = '2500';
let cookies = '';

const termOptions = new URL('https://nubanner.neu.edu/StudentRegistrationSsb/ssb/classSearch/getTerms');
termOptions.searchParams.append('searchTerm', '');
termOptions.searchParams.append('offset', '1');
termOptions.searchParams.append('max', '10');

const fetchData = async () => {
  try {
    // Fetch terms
    let response = await fetch(termOptions, { method: 'GET' });
    cookies = response.headers.get('set-cookie') || '';
    const terms = await response.json();
    console.log("TERMS")
    console.log(terms)

    // Assume TERM_CODE from terms
    const TERM_CODE = '202410';

    // POST to set term
    // const postUrl = 'https://nubanner.neu.edu/StudentRegistrationSsb/ssb/term/search?mode=search';
    // response = await fetch(postUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Cookie': cookies
    //   },
    //   body: `term=${TERM_CODE}`
    // });
    // console.log("Setting Term")
    // console.log(JSON.stringify(response));
    // console.log(JSON.stringify(await response.json()));
    // Search courses
    const searchUrl = new URL('https://nubanner.neu.edu/StudentRegistrationSsb/ssb/searchResults/searchResults');
    // searchUrl.searchParams.append('txt_subject', SUBJECT);
    // searchUrl.searchParams.append('txt_courseNumber', COURSE_NUMBER);
    searchUrl.searchParams.append('txt_term', TERM_CODE);
    searchUrl.searchParams.append('pageOffset', '0');
    searchUrl.searchParams.append('pageMaxSize', '10');
    searchUrl.searchParams.append('sortColumn', 'subjectDescription');
    searchUrl.searchParams.append('sortDirection', 'asc');

    response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    const searchResults = await response.json();
    // searchResults['ztcEncodedImage'] = null;
    // searchResults['searchResultsConfigs'] = null;

    console.log(JSON.stringify(searchResults.data));
    console.log(JSON.stringify(searchResults));

  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

fetchData();
