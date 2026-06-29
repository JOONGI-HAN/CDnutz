import Spinner from "../duplicate/spinner";

function GameCover({data, loading, redacted = false, className = ""}) {

    return (
        <div className = {`rounded-lg overflow-hidden border border-[var(--border)] shadow-2xl
                           bg-[var(--surface-dark-mid)] flex-shrink-0 flex items-center justify-center
                           ${className || "w-full max-w-[200px] xl:max-w-none aspect-[3/4]"}`}>

          {loading ?
            <Spinner />
          : data.cover ? (
                <img
                  src       = {redacted ? `data:image/jpeg;base64,${data.cover}` : data.cover}
                  alt       = {data.title}
                  loading   = "lazy"
                  className = "w-full h-full object-cover"
                />
              ) : (
                <div className = "w-full h-full flex items-center justify-center
                                  text-[var(--color-text-dim)] text-3xl">
                  ?
                </div>
              )
          }
        </div>

    )
}

export default GameCover;