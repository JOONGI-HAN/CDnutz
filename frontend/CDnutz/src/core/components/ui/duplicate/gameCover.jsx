

function GameCover({data, redacted = false}) {

    return (
        <div className = "w-full max-w-[200px] xl:max-w-none rounded-lg aspect-[3/4]
                                  overflow-hidden border border-[var(--border)] shadow-2xl
                                  bg-[var(--surface-dark-mid)] flex-shrink-0">
          {data.cover ? (
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
          )}
        </div>

    )
}

export default GameCover;