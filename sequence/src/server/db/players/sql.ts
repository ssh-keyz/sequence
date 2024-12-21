export const CREATE_PLAYER = `
INSERT INTO players (session_id)
VALUES ($1)
RETURNING id, session_id
`;

export const FIND_BY_SESSION = `
SELECT id, session_id
FROM players
WHERE session_id = $1
`; 