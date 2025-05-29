const BASE_URL = 'https://openlibrary.org/works/'

export const get_book_info = async (cover_edition_key: string) => {
    const response = await fetch(`${BASE_URL}${cover_edition_key}.json`)
    const data = await response.json()
    return data;
}