/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

import packageJson from '../../package.json';

export const environment = {
  production: true,
  version: packageJson.version
};
