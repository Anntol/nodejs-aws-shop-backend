export const getResponse = (statusCode: number, body: unknown) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': "*",
            'Access-Control-Allow-Headers': "*",
            'Access-Control-Allow-Methods': "OPTIONS,GET"
        },
        body: JSON.stringify(body)
    }
};
