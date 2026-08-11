
const ArtworkPage = async (props: PageProps<"/admin/submissions/[id]">) => {
    const { id } = await props.params;

    return (
        <>{id}</>
    );
};

export default ArtworkPage;
