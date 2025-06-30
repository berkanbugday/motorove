import { registerEnumType } from '@nestjs/graphql';
import { InvitationStatus } from '@motorove/shared';

registerEnumType(InvitationStatus, { name: 'InvitationStatus' });

export { InvitationStatus };
