export async function isParticipantAdmin(sock, key) {
  try {
    const groupMetadata = await sock.groupMetadata(key.remoteJid);

    const participant = groupMetadata.participants.find(
      (p) => p.id === key.participant,
    );

    // Check if the participant exists and if they are an admin
    console.log(participant);
    if (
      participant &&
      (participant.admin === 'admin' || participant.admin === 'superadmin')
    ) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error fetching group metadata:', error);
    return false;
  }
}
export function isGroupMessage(key) {
  /**
   * when remoteJid ends with "@g.us" message is from a group
   */
  return key.remoteJid?.endsWith('@g.us');
}
