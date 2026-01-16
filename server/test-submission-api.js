// Teste rápido da API de submissions
const testSubmissionAPI = async () => {
    try {
        // Substitua este ID por um ID real de submission do seu banco
        const submissionId = '677e9a1234567890abcdef12'; // EXEMPLO - USE UM ID REAL

        const response = await fetch(`http://localhost:5000/api/submissions/${submissionId}`);
        const data = await response.json();

        console.log('=== TESTE DA API DE SUBMISSION ===');
        console.log('Status:', response.status);
        console.log('\n=== DADOS DO FORM ===');
        console.log('Title:', data.form?.title);
        console.log('CoverImage:', data.form?.coverImage);
        console.log('Logo:', data.form?.logo);
        console.log('EventDate:', data.form?.eventDate);
        console.log('Location:', data.form?.location);
        console.log('\n=== DADOS DO CREATOR ===');
        console.log('Name:', data.form?.creator?.name);
        console.log('ProfilePhoto:', data.form?.creator?.profilePhoto);
        console.log('Bio:', data.form?.creator?.bio);

        if (!data.form?.coverImage) {
            console.log('\n⚠️ ATENÇÃO: coverImage está undefined ou null!');
        } else {
            console.log('\n✅ coverImage está presente!');
        }

        console.log('\n=== JSON COMPLETO ===');
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Erro no teste:', error.message);
    }
};

testSubmissionAPI();
