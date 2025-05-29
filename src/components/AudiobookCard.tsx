import { FaPeopleGroup } from "react-icons/fa6"

interface AudiobookCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
    title: string;
    link: string;
    seeders: string;
    onDownload: (link: string) => void;
}

const DefaultButton = ({children, ...props}: React.ComponentProps<"button">) =>{
    return (
        <button {...props}>
            {children}
        </button>
    )
}

export default function AudiobookCard({title, link, seeders, onDownload, ...buttonProps}: AudiobookCardProps){
    return (
        <DefaultButton
            className={`${buttonProps.className}`}
            onClick={() => onDownload(link)}
            {...buttonProps}
        >
            <h2>{title}</h2>
            <span title="seeders" className="flex items-center"><FaPeopleGroup/> {seeders}</span>
        </DefaultButton>
    )
}