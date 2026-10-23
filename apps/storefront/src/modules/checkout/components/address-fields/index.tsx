import {
  INDIAN_STATES,
  MOBILE_PATTERN,
  PINCODE_PATTERN,
} from "@lib/util/indian-address"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import React, { useEffect, useRef } from "react"

type AddressPrefix = "shipping_address" | "billing_address"

/**
 * Indian delivery address fields, named `<prefix>.<field>` for the checkout's `setAddresses`
 * action, or plain `<field>` without a prefix (saved addresses in the account).
 * The store ships within India only, so the country is fixed.
 */
const AddressFields = ({
  prefix,
  values,
  onChange,
}: {
  prefix?: AddressPrefix
  values: Record<string, string>
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void
}) => {
  const field = (name: string) => (prefix ? `${prefix}.${name}` : name)
  // Always a string, so every field is controlled from the first render and the state select
  // shows its "State" placeholder instead of the browser picking the first state.
  const value = (name: string) => values[field(name)] ?? ""
  const testId = (name: string) =>
    `${prefix === "shipping_address" ? "shipping" : prefix ? "billing" : "address"}-${name}`

  // React resets a form after its action runs and restores controlled inputs,
  // but not controlled selects, so the chosen state is put back by hand.
  const stateSelect = useRef<HTMLSelectElement>(null)
  const province = value("province")
  useEffect(() => {
    const form = stateSelect.current?.form
    if (!form) {
      return
    }
    const restore = () =>
      setTimeout(() => {
        if (stateSelect.current) {
          stateSelect.current.value = province
        }
      })
    form.addEventListener("reset", restore)
    return () => form.removeEventListener("reset", restore)
  }, [province])

  return (
    <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-4">
      <Input
        label="First name"
        name={field("first_name")}
        autoComplete="given-name"
        value={value("first_name")}
        onChange={onChange}
        required
        data-testid={testId("first-name-input")}
      />
      <Input
        label="Last name"
        name={field("last_name")}
        autoComplete="family-name"
        value={value("last_name")}
        onChange={onChange}
        data-testid={testId("last-name-input")}
      />
      <div className="xsmall:col-span-2">
        <Input
          label="House / flat, street"
          name={field("address_1")}
          autoComplete="address-line1"
          value={value("address_1")}
          onChange={onChange}
          required
          minLength={5}
          data-testid={testId("address-input")}
        />
      </div>
      <div className="xsmall:col-span-2">
        <Input
          label="Area, landmark (optional)"
          name={field("address_2")}
          autoComplete="address-line2"
          value={value("address_2")}
          onChange={onChange}
          data-testid={testId("address-2-input")}
        />
      </div>
      <Input
        label="City"
        name={field("city")}
        autoComplete="address-level2"
        value={value("city")}
        onChange={onChange}
        required
        data-testid={testId("city-input")}
      />
      <NativeSelect
        ref={stateSelect}
        name={field("province")}
        autoComplete="address-level1"
        placeholder="State"
        aria-label="State"
        value={province}
        onChange={onChange}
        required
        data-testid={testId("province-select")}
      >
        {INDIAN_STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </NativeSelect>
      <Input
        label="Pincode"
        name={field("postal_code")}
        autoComplete="postal-code"
        inputMode="numeric"
        maxLength={6}
        pattern={PINCODE_PATTERN}
        title="Enter a valid 6-digit pincode."
        value={value("postal_code")}
        onChange={onChange}
        required
        data-testid={testId("postal-code-input")}
      />
      <Input
        label="Mobile number"
        name={field("phone")}
        type="tel"
        autoComplete="tel-national"
        inputMode="numeric"
        maxLength={10}
        pattern={MOBILE_PATTERN}
        title="Enter a valid 10-digit mobile number."
        value={value("phone")}
        onChange={onChange}
        required
        data-testid={testId("phone-input")}
      />
      <input type="hidden" name={field("country_code")} value="in" />
    </div>
  )
}

export default AddressFields
