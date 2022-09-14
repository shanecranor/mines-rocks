import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
let API_KEY = process.env.NEXT_PUBLIC_API_KEY

async function queryApi( endpoint: string, key?: string) {
  const response = await fetch(
    `${API_URL(key)}${endpoint}}`
  );
  return (await response.json());
}

function Example(){
  const [canvasApiKey, setCanvasApiKey] = useState(API_KEY);
  const [response, setResponse] = useState();
  //CHANGE ME!
  const ENDPOINT = "api/v1/courses?enrollment_state=active"
  //
  return (
    <>
      <Head>
        <title>Canvas API explorer</title>
        <meta name="description" content="play with the API!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>Canvas API endpoint runner</p>
        <button
			// run javascript function on click!
			onClick={async () => setResponse(await queryApi(ENDPOINT))}
		>
			Press me to execute query
		</button>
		<p>Query response will end up here {response && JSON.stringify(response)}</p>
        <p>Paste your canvas API key here:</p>
        <input type="text"
          value={canvasApiKey || typeof window !== 'undefined' && localStorage.getItem('API_KEY')}
          style={{ width: "30%", "marginBottom": "20px" }}
          onChange={(e) => {
            setCanvasApiKey(e.target.value);
			//saves the API key in your browser so you don't need to type it in again on refresh
            localStorage.setItem('API_KEY', e.target.value);
          }}
        ></input>
      </main>
    </>
  )
}

function API_URL(key?: string) {
	if (!API_KEY) {
	  API_KEY = localStorage.getItem('API_KEY')
	}
	if (key) return `https://canvas.shanecranor.workers.dev/?bearer=${key}&req=`
	if (API_KEY) return `https://canvas.shanecranor.workers.dev/?bearer=${API_KEY}&req=`
	console.error(".env.local API key not found and no key passed")
}

export default Example
