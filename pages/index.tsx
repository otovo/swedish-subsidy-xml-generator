import { useState } from 'react';

const IndexPage = () => {
  const [textAreaContent, setTextAreaContent] = useState('');
  const [xmlResponse, setXmlResponse] = useState('');

  async function onSubmit(e, type) {
    e.preventDefault();
    setXmlResponse('');
    const response = await window.fetch(`/api/csv-to-xml?type=${type}`, {
      method: 'POST',
      body: textAreaContent,
      headers: {
        'content-type': 'text/plain',
      },
    });
    const text = await response.text();
    setXmlResponse(text);
  }

  return (
    <>
      <h1>Claim ROT and Grön Stöd via XML</h1>
      <p>
        This webapp helps you create the XML files to claim subsidies from the
        Swedish government. Please read{' '}
        <a href="https://www.notion.so/otovo/Claim-ROT-and-Gr-n-St-d-via-XML-317a0e0793d04305b15a06b82d382ee0">
          the documentation
        </a>{' '}
        for more information.
      </p>
      <pre>{xmlResponse}</pre>
      <h1>Paste your CSV and hit submit</h1>
      <form>
        <textarea
          cols={100}
          rows={20}
          value={textAreaContent}
          onChange={(e) => setTextAreaContent(e.target.value)}
        />
        <br />
        <button
          onClick={(e) => {
            onSubmit(e, 'gron');
          }}
        >
          Submit Grön Stöd
        </button>
        <button
          onClick={(e) => {
            onSubmit(e, 'rot');
          }}
        >
          Submit ROT
        </button>
      </form>
    </>
  );
};

export default IndexPage;
