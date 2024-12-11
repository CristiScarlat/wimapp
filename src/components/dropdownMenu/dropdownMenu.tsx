import { SyntheticEvent } from "react";

interface Props {
    items: string[]
    onSelectItem: (event: SyntheticEvent<HTMLSelectElement, Event>) => void
    className?: string
}

const DropdownMenu = ({items, onSelectItem, className}: Props) => {

    return (
        <select className={className} onChange={onSelectItem}>
            {items.map((item: string, i: number) => (
                <option key={item+i} value={item}>{item}</option>
            ))}
        </select>
    )
}

export default DropdownMenu;