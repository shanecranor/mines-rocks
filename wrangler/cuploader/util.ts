export function buildResponse(data: any, status: number) {
    const encodedData = JSON.stringify(data)
    return new Response(
        encodedData, {
        headers: {
            //todo: restrict to mines.rocks?
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'content-type': 'application/json;charset=UTF-8'
        },
        status: status
    }
    )
}