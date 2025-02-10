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
    console.log('Participant does not have rights to execute this command');
    return false;
  } catch (error) {
    console.error('Error fetching group metadata:', error);
    return false;
  }
}
export async function isGroupMessage(key) {
  /**
   * when remotteJid ends with "@g.us" message is from a group
   */
  return key.remoteJid?.endsWith('@g.us');
}
