import {
    InitSearch,
    DataSearch,
    ConsoSearch
} from './Interfaces';

export async function getInitSearch(index: string): Promise<InitSearch> {
    const response = await fetch(process.env.BACKEND_URL + '/dashboard/get_init_search',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: index
            })
        }
    );
    if (!response.ok) {
        return response.text().then(text => {throw new Error(text)});
    }
    return await response.json();
}

export async function getDataSearch(
        index: string,
        total: number,
        paginate_from: number,
        paginate_size: number,
        orderby: string,
        orderdir: string,
        filter_products: string[]
    ): Promise<DataSearch> {
    const response = await fetch(process.env.BACKEND_URL + '/dashboard/get_data_search',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: index,
                total: total,
                paginate_from: paginate_from,
                paginate_size: paginate_size,
                orderby: orderby,
                orderdir: orderdir,
                filter_products: JSON.stringify(filter_products)
            })
        }
    );
    if (!response.ok) {
        return response.text().then(text => {throw new Error(text)});
    }
    return await response.json();
}

export async function getConsoSearch(
        index: string,
        filter_products: string[]
    ): Promise<ConsoSearch> {
    const response = await fetch(process.env.BACKEND_URL + '/dashboard/get_conso_search',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                index: index,
                filter_products: JSON.stringify(filter_products)
            })
        }
    );
    if (!response.ok) {
        return response.text().then(text => {throw new Error(text)});
    }
    return await response.json();
}
