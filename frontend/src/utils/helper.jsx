export const fetchMethod = async (
    method,
    setLoading = () => { },
    hasObject = true,
    loadingName = "loading",
) => {
    let response = {};
    hasObject
        ? setLoading((prev) => ({ ...prev, [loadingName]: true }))
        : setLoading(true);
    await method()
        .then((res) => {
            response = res.data;
        })
        .catch((err) => {
            response = err.response?.data;
            response.status = false;
            console.log(err);
        })
        .finally(() => {
            hasObject
                ? setLoading((prev) => ({ ...prev, [loadingName]: false }))
                : setLoading(false);
        });
    return { response: response };
};
