import { HttpTypes } from "@medusajs/types"

export default function ProductTabs({ product }: { product: HttpTypes.StoreProduct }) {
  const specifications = [
    ["Material", product.material],
    ["Country of origin", product.origin_country],
    ["Type", product.type?.value],
    ["Weight", product.weight ? product.weight + " g" : null],
  ].filter((entry) => entry[1])
  return <div className="pd-accordions">
    <details open><summary>Product details</summary>{product.description ? <p>{product.description}</p> : <p>Product information will be added when confirmed.</p>}</details>
    <details><summary>Specifications</summary>{specifications.length ? <dl>{specifications.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p>Final specifications and dimensions have not yet been published.</p>}</details>
    <details><summary>What’s included</summary><p>Package contents will be published with the confirmed product details.</p></details>
    <details><summary>Delivery &amp; returns</summary><p>Delivery and returns information will be added when the business policies are finalized.</p></details>
  </div>
}
