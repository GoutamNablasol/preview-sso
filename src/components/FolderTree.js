import React, { useState } from 'react'



const FolderTree = ({explorer}) => {
    
    const [expand , setExpand] = useState(true);
    
    function File (name) {
        console.log(name);
    }

  if(explorer.isFolder) {
    return (
        <div style={{ marginTop: 0 }}>
            <div className='folder' onClick={() => setExpand(!expand)}>
                <span>📁 {explorer.name}</span>
            </div>
        <div style={{ display: expand ? 'block' : 'none' ,  paddingLeft: 15}}>
            {
                explorer.items.map((exp) => {
                    return (
                        <FolderTree key={exp.id} explorer={exp} />
                    )
                })
            }
        </div>
        </div>
    )
  } else {
    return <span onClick={() => File(explorer.name)} className='file'>📄 {explorer.name}</span>
  }
}

export default FolderTree