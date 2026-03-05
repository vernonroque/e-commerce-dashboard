import '../stylesheets/StoreSelector.css'

function StoreSelector({stores, selStore, setSelStore}){
    const storeList = [];

        const handleChange = (e) => {
        const selected = e.target.value;
        setSelStore(selected);
        }

    for(const key in stores){
        storeList.push(stores[key].name);
    }

    return(
        <div className = "StoreSelector">
            <select value={selStore || ''} onChange={handleChange}>
                <option key='default' value=''>Select Store</option>
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