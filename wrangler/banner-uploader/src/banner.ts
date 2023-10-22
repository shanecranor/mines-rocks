import { Season, Term } from "./types";

// const baseUrl = "https://nubanner.neu.edu/"
// const baseUrl = "https://bannerssb9.mines.edu/";

//use our hot new proxy server because cloudflare chooses a random ip address for each request :(
const baseUrl = "https://banner-9.mines.rocks/"



export const getTermCode = async (termSeason: Season, termYear: string) => {
    const terms = await getTerms();
    //convert terms to lowercase

    const term = terms.find(term => term.description.toLowerCase().includes(`${termSeason.toLowerCase()} ${termYear}`));
    if (!term) {
        throw new Error(`Term ${termSeason} ${termYear} not found`);
    }
    return term.code;
}
export const getCourseData = async (subject: string, courseNumber: string) => {
    // console.log(await initBannerCookies());
    const terms = await getTerms();
    const { data: idk, cookies } = await setTerm(terms[0].code);
    const searchParams = {
        termCode: terms[0].code, subject, courseNumber
    }
    return (await getCourseSearchResults(searchParams, cookies))
};
function makeParamURL(link: string, params: Record<string, string>) {
    const url = new URL(link);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
    }
    return url;
}
export async function getCourseSearchResults(searchParams: { termCode: string, subject: string, courseNumber: string }, cookies: string) {
    const { termCode, subject, courseNumber } = searchParams;
    const params = {
        txt_subject: subject,
        txt_courseNumber: courseNumber,
        txt_term: termCode,
        startDatepicker: "",
        endDatepicker: "",
        pageOffset: "0",
        pageMaxSize: "50", //if there is a class with more than 50 sections that is nuts
        sortColumn: "subjectDescription",
        sortDirection: "asc",
    };
    const url = makeParamURL(
        `${baseUrl}StudentRegistrationSsb/ssb/searchResults/searchResults`,
        params
    );
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            Cookie: cookies,
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    if (typeof json !== "object" || json === null) {
        throw new Error(`Error extracting json from banner response: ${json}`)
    }
    if ("success" in json && json.success === false) {
        throw new Error(`Banner authentication failed: ${JSON.stringify(json)}`)
    }
    if (!("data" in json)) {
        throw new Error(`Banner response does not contain data: ${JSON.stringify(json)}`)
    }
    return json.data;
}

export async function getTerms(): Promise<Term[]> {
    const url = makeParamURL(
        `${baseUrl}StudentRegistrationSsb/ssb/classSearch/getTerms`,
        {
            searchTerm: "",
            offset: "1",
            max: "100",
        }
    );

    const termResponse = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
        },
        // breaks cloudflare for whatever reason 🤷‍♀️
        // referrer: `${baseUrl}StudentRegistrationSsb/ssb/term/termSelection?mode=search`,
    });

    if (!termResponse.ok) {
        throw new Error(`HTTP error! status: ${termResponse.status}`);
    }

    return (await termResponse.json()) as Term[];
}

export async function setTerm(termCode: string): Promise<{ data: string, cookies: string }> {
    const formData = new FormData();
    formData.append("term", termCode);
    formData.append("studyPath", "");
    formData.append("studyPathText", "");
    formData.append("startDatepicker", "");
    formData.append("endDatepicker", "");
    const url = new URL(`${baseUrl}StudentRegistrationSsb/ssb/term/search`);
    url.searchParams.append("mode", "search");
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
        },
        body: formData,
    });
    return {
        data: JSON.stringify(await response.json()),
        cookies: response.headers.get("set-cookie") || "",
    };
}


// fetchData();
