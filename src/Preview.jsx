/* eslint-disable react-hooks/exhaustive-deps */
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import './App.css'
import { useMsal } from "@azure/msal-react";
import { redirect } from "react-router-dom";
import CsvReader from "./CsvReader";
import FolderTree from "./components/FolderTree";
import { explorer } from "./components/dummy";


const extensionSupportCheck = (fileURL) => {
  const extensionsSupported = [".csv", ".odt", ".doc", ".docx", ".gif", ".htm", ".html", ".jpg", ".jpeg", ".pdf", ".ppt", ".pptx", ".tiff", ".txt", ".xls", ".xlsx"];
  const fileExtension = fileURL?.substring(fileURL?.lastIndexOf('.')).toLowerCase(); // Convert to lowercase
  const isSupported = extensionsSupported.includes(fileExtension);

  return isSupported;
}


const getHeaders = () => {

  // encrypting variables 
  let prefix = 'jR3n8KsW9xH4QvXcE2mY7i5FHa';
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(); // Convert timestamp to a string

  //function for encrypting 
  function encodeString(prefix, timestamp) {
    let reversedPrefix = '';

    for (let i = prefix.length - 1; i >= 0; i--) {
      reversedPrefix += prefix.substring(i, i + 1);
    }

    let result = '';
    result = reversedPrefix.substring(13) + reversedPrefix.substring(0, 13) + '___';

    let reversedTime = '';
    for (let i = timestamp.length - 1; i >= 0; i--) {
      reversedTime += timestamp.substring(i, i + 1);
    }
    reversedTime = reversedTime.substring(5) + reversedTime.substring(0, 5);

    return result + reversedTime;
  }

  const encodedString = encodeString(prefix, timestamp);

  return {
    Authorization: encodedString,
    'Content-Type': 'application/json'
  }

}

const ErrorComponent = ({ error, expired, logOut }) => {
  return (
    <>
      {(error?.data?.statuscode === 400 || error?.data?.statuscode === 404 || error?.data?.statuscode === 501 || error?.data?.statuscode === 504) && (
        <div className="message-container">
          <div className="error-container">
            <div className="message-container">
          <span className="error-message">{error?.data?.status}</span>
              {error?.data?.statuscode === 404 && (
                <button className="button-Prev" onClick={() => logOut()}>
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


function Preview({ responseD }) {
  const { instance } = useMsal();
  const docViewerRef = useRef(null);

  const [expired, setExpired] = useState(false);
  const [query, setQuery] = useState();
  const [files, setFilesObj] = useState();
  const [fileURL, setFileURL] = useState();
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isURLLoading, setIsURLLoading] = useState(false);
  const [error, setError] = useState(false);

  const URL = "https://anthempreviewnew.azurewebsites.net/DownloadAzureFile.php";

  useEffect(() => {
    // Get the query string from the current URL
    const queryString = window.location.search;
    // Parse the query parameters into an object
    const urlParams = new URLSearchParams(queryString);
    // Access the data using the parameter name you used while passing it
    const id = urlParams.get('id');
    // Now you can use the 'data' variable in your component
    setQuery({ id})

  }, []);

  //get file names list from API
  const getFilesFromServer = async () => {

    setIsLoading(true);

    try {
      const response = await axios.post(URL, {
        id: query.id,
        type: "fetchFileList",
        email: responseD?.mail,
      
      }, {
        headers: getHeaders()
      });
      //passing body in the first parameter and in second parameter passing headers

      const data = response?.data?.FileArray

      //since no file found message is coming in response not in error
      setError(response)
      setFilesObj(data);
      setIsLoading(false)

    } catch (error) {
      console.log("error: ", error)
    } finally {
      setIsLoading(false);
    }
  };

  //get perticular file remote path from API
  const getFilesURLFromServer = async () => {

    setIsURLLoading(true);

    try {
      const response = await axios.post(URL, {
        id: query.id,
        type: "fetchFileUrl",
        fileName: files[index]
      }, {
        headers: getHeaders()
      });

      const data = response?.data?.fileUrl

      console.log(data, "+++file URL+++");
      setError(response)
      setFileURL("https://" + data)

    } catch (error) {
      console.log("error: ", error)
    } finally {
      setIsURLLoading(false);
    }
  };

  //calling get file names list api when we get sso response and param ID
  useEffect(() => {
    // if (responseD) {
      getFilesFromServer();
    // }
  }, []);

  //calling get file URL api when we get sso response and param ID
  useEffect(() => {
    if (files) {
      getFilesURLFromServer();
    }
  }, [index, files]);



  //navigate through files object using index
  const nextFile = () => {
    if (index < files.length - 1) {
      setIndex(index + 1)
    }
  }
  const prevFile = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  //incase lost internet connection
  const showAlertOnOffline = () => {
    if (!navigator.onLine) {
      alert("You are currently offline. Please check your internet connection.");
    }
  };
  showAlertOnOffline()


  //file downloading funtion
  const handleImageDownload = () => {
    const fileUrl = fileURL
    fetch(fileUrl)
      .then((response) => {
        response.arrayBuffer().then(function (buffer) {
          const url = window.URL.createObjectURL(new Blob([buffer]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", files[index]);
          document.body.appendChild(link);
          link.click();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function logOut() {
    instance
      .logoutPopup()
      .then((data) => {
        redirect(`/?id=${query.id}&bodyData=${query.bodyData}&salesforceURI=${query.salesforceURI}&tokenURL=${query.tokenURL}`);
        window.location.reload();
      })
      .catch((e) => {
        console.error(e);
      });
  }

  return (
    <div className="main-container">
      {
        isLoading && <div className="loader-container">
          <div className="loader"></div>
        </div>
      }
      {
        true ? (
          <>
            <div className="container">

              <div className="secondry-container">
                <div className="sidebar">
                  <div style={{ fontWeight: "bold", fontSize: "15px" }}>Browse Files</div>
                  {/* {files.map((item, i) => {
                    return (
                      <div
                        key={item}
                        onClick={() => {
                          setIndex(i);
                        }}
                        className={`${index === i && "active"} element`}
                      >
                        {item}
                      </div>
                    );
                  })} */}
                  <FolderTree explorer={explorer}/>
                </div>
                {/* <div className="preview">
                  <div className="view-header">
                    <div style={{ display: "flex", alignItems: "center" }}>File name: {files[index]}{<button className="button-Next" onClick={handleImageDownload}>Download</button>}</div>
                    <div className="view-header-section">
                      <div style={{ padding: "0px 5px 0px 5px" }}>
                        Document {index + 1} of {files?.length}
                      </div>
                      <div className="button-container">
                        <button
                          disabled={index < 1}
                          className="button-Prev"
                          onClick={() => {
                            docViewerRef?.current?.prev();
                            prevFile();
                          }}
                        >
                          Prev Doc
                        </button>
                        <button
                          disabled={index >= files?.length - 1}
                          className="button-Next"
                          onClick={() => {
                            nextFile();
                            docViewerRef?.current?.next();
                          }}
                        >
                          Next Doc
                        </button>
                      </div>
                    </div>
                  </div>
                  {
                    fileURL ? (
                      extensionSupportCheck(files[index]) ? (
                        isURLLoading ? (
                          <div className="url-loading">
                            <div>Loading...</div>
                          </div>
                        ) : files[index]?.substring(files[index]?.lastIndexOf('.')) === '.csv' ? (
                          <CsvReader key={files[index]} url={fileURL} />
                        ) : (
                          <DocViewer
                            documents={[{ uri: fileURL }]}
                            ref={docViewerRef}
                            config={{
                              header: {
                                disableHeader: true,
                                disableFileName: false,
                                retainURLParams: false,
                              },
                            }}
                            pluginRenderers={DocViewerRenderers}
                            style={{ height: 795 }}
                          />
                        )
                      ) : (
                        <div className="url-loading">
                          <div className="not-supported">File not supported for previewing.</div>
                        </div>
                      )
                    ) : null
                  }

                </div> */}
              </div>
            </div>
          </>
        ) : <></>
      }
      <ErrorComponent error={error} expired={expired} logOut={logOut} />
    </div>
  );
}

export default Preview;
