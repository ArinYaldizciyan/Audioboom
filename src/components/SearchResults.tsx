import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FaPeopleGroup } from "react-icons/fa6";

interface SearchResultsProps {
  isLoading: boolean;
  data: any[] | undefined;
  handleDownload: (link: string) => void;
  downloadLoading: boolean;
}

export default function SearchResults({
  isLoading,
  data,
  handleDownload,
  downloadLoading,
}: SearchResultsProps) {
  return (
    <>
      {isLoading || downloadLoading ? (
        <div className="w-full flex justify-center items-center min-h-[200px]">
          {isLoading ? (
            <ul className="w-full">
              {[...Array(10)].map((_, idx) => (
                <li key={idx}>
                  <Skeleton className="w-full m-1 p-2 h-10" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Starting download...</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <ul className="w-full">
            {data?.map((item: any, idx: number) => (
              <li key={idx}>
                <Button
                  className="flex w-full my-2 py-2 truncate !text-left !justify-start"
                  variant={"secondary"}
                  onClick={() => {
                    handleDownload(item.link);
                  }}
                  title={item.title}
                >
                  <span className="flex-grow truncate">{item.title}</span>
                  <div
                    title={`${item.seeders} seeder${
                      item.seeders == 1 ? "" : "s"
                    }`}
                    className="flex flex-shrink-0 text-sm text-gray-500 items-center"
                  >
                    <span className="mx-2">{item.seeders}</span>
                    <FaPeopleGroup />
                  </div>
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
