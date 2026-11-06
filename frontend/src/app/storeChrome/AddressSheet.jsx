/**
 * @param {{ chrome: ReturnType<import('./useStoreChrome').useStoreChrome> }} props
 */
export function AddressSheet({ chrome }) {
  return (
    <form
      className="panel sheet"
      id="address"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-title"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        void chrome.saveAddress(String(data.get('street') ?? ''))
      }}
    >
      <button className="close" type="button" aria-label="Закрыть" onClick={chrome.closeLayers}>
        ×
      </button>
      <h2 id="address-title">Куда везти</h2>
      <p className="muted">Без улицы стейк в корзину не кладётся.</p>
      {chrome.fulfillmentError ? <p role="alert">{chrome.fulfillmentError}</p> : null}
      <label className="field" htmlFor="street">
        Улица и дом
      </label>
      <input
        id="street"
        name="street"
        type="text"
        required
        maxLength={80}
        placeholder="Ленина 10"
        defaultValue={chrome.address}
      />
      <button className="btn btn-accent" type="submit">
        Сохранить адрес
      </button>
    </form>
  )
}
