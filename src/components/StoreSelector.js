import '../stylesheets/StoreSelector.css'

function StoreSelector({stores, selStore, setSelStore}){
    const storeList = [];

    const handleChange = (e) => {
        const selectedId = Number(e.target.value);
        const store = storeList.find(s => s.id === selectedId);
        setSelStore(store);
    }

    for(const key in stores){
        storeList.push(stores[key]);
        // console.log("the store object is >>>", stores[key]);
    }

    return(
        <div className="StoreSelector">
            <select value={selStore ? selStore.id : ''} onChange={handleChange}>
                {selStore && (
                <option value={selStore.id}>{selStore.name}</option>
                )}

                {storeList
                .filter(item => item.id !== selStore?.id)
                .map((item) => (
                    <option key={item.id} value={item.id}>
                    {item.name}
                    </option>
                ))}
            </select>
        </div>
    );

}

export default StoreSelector;