// Local PDF Library Mock
export const GlobalWorkerOptions = { workerSrc: '' }
export const getDocument = () => ({
  promise: Promise.resolve({
    numPages: 0,
    getPage: () =>
      Promise.resolve({
        getTextContent: () =>
          Promise.resolve({
            items: [],
          }),
      }),
  }),
})
