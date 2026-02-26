import '../stylesheets/StoreSelector.css'

function StoreSelector({stores}){
    const storeList = [];

    for(const key in stores){
        storeList.push(stores[key].name);
    }

    return(
        <div className = "StoreSelector">
            <select value='' onChange=''>
                {
                    storeList.map((item, index) => (    
                        <option key={index} value={item}>{item}</option>
                        
                    ))
                }
            </select>
        </div>

    );

}

export default StoreSelector;