import { SyntheticEvent } from "react";

interface Props {
    items: string[]
    onSelectItem: (event: SyntheticEvent<HTMLSelectElement, Event>) => void
    className?: string
    disabledLabel?: string
    showDisabledItem?: boolean
}

const DropdownMenu = ({items, onSelectItem, className, disabledLabel, showDisabledItem}: Props) => {

    return (
        <select className={className} onChange={onSelectItem}>
            {showDisabledItem && <option selected disabled>{disabledLabel}</option>}
            {items.map((item: string, i: number) => (
                <option key={item+i} value={item}>{item}</option>
            ))}
        </select>
    )
}

export default DropdownMenu;