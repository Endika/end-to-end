/**
 * @license
 * Copyright 2015 Google Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Interface to provide a OpenPGP Key Manager.
 */

goog.provide('e2e.openpgp.KeyManager');



/**
 * KeyManager interface.
 * KeyManager is a single per-application object that serves as a high-level
 * resolver for the keys using various KeyProviders and implements the
 * application policy in regards to:
 * <ul>
 *   <li>key provider preference
 *   <li>key preference (i.e. which key, if any, should be preferred on
 *       collisions,
 *   <li>key lifetime (how the application should treat the old keys),
 *   <li>error handling (e.g. some provider errors can be resolved in
 *       KeyManager).
 * </ul>
 * @interface
 */
e2e.openpgp.KeyManager = function() {};


/**
 * Returns trusted keys for a given purpose for a user with given e-mail
 * address. Use this to fetch the keys to use with
 * {@link Context2#verifyDecrypt} and {@link Context2#encryptSign}.
 * @param {!e2e.openpgp.KeyPurposeType} purpose The purpose of the key.
 * @param {!e2e.openpgp.UserEmail} email The email address.
 * @return {!e2e.openpgp.KeysPromise} The resulting trusted keys.
 * @export
 */
e2e.openpgp.KeyManager.prototype.getTrustedKeys = goog.abstractMethod;


/**
 * Returns keys for a given purpose that match a given OpenPGP Key ID. If a
 * wildcard key ID is passed, return all keys for that purpose.
 * @see https://tools.ietf.org/html/rfc4880#section-5.1
 * @param {!e2e.openpgp.KeyPurposeType} purpose The purpose of the key. Only
 *     verification and decryption purpose should be accepted.
 * @param {!e2e.openpgp.KeyId} id The key ID.
 * @return {!e2e.openpgp.KeysPromise} The resulting keys, potentially untrusted.
 * @export
 */
e2e.openpgp.KeyManager.prototype.getKeysByKeyId = goog.abstractMethod;


/**
 * Returns all secret/public keys.
 * @param {!e2e.openpgp.KeyRingType} keyringType
 * @param {e2e.openpgp.KeyProviderId=} opt_providerId If passed, only return the
 *     keys from this KeyProvider.
 * @return {!e2e.openpgp.KeysPromise} The resulting keys, potentially untrusted.
 * @export
 */
e2e.openpgp.KeyManager.prototype.getAllKeys = goog.abstractMethod;


/**
 * Returns all public and secret keys with User ID pointing to a given e-mail
 * address from the keyring. Use this to simplify key management when keys are
 * indexed by e-mail address (e.g. in contact list). Returned keys may be
 * untrusted.
 * @param {!e2e.openpgp.UserEmail} email The email address.
 * @return {!e2e.openpgp.KeysPromise} The resulting keys, potentially untrusted.
 * @export
 */
e2e.openpgp.KeyManager.prototype.getAllKeysByEmail = goog.abstractMethod;


/**
 * Returns a single key that has a matching OpenPGP fingerprint.
 * @param {!e2e.openpgp.KeyFingerprint} fingerprint The key fingerprint
 * @param {e2e.openpgp.KeyProviderId=} opt_providerId If passed, only return the
 *     keys from this KeyProvider.
 * @return {!e2e.openpgp.KeyPromise} The resulting key, potentially
 *     untrusted.
 * @export
 */
e2e.openpgp.KeyManager.prototype.getKeyByFingerprint = goog.abstractMethod;


/**
 * Returns all possible key generation options supported by KeyManager.
 * @return {!goog.Thenable<!Array.<!e2e.openpgp.KeyGenerateOptions>>} Available
 *     key generation options.
 * @export
 */
e2e.openpgp.KeyManager.prototype.getAllKeyGenerateOptions = goog.abstractMethod;


/**
 * Generates a keypair. The returned keys are implicitly trusted for appropriate
 * purposes.
 * @param {string} userId User ID for the generated keys.
 * @param {!e2e.openpgp.KeyGenerateOptions} generateOptions Key generation
 *     options.
 * @return {!goog.Thenable<!e2e.openpgp.KeyPair>} The generated keypair.
 * @export
 */
e2e.openpgp.KeyManager.prototype.generateKeyPair = goog.abstractMethod;


/**
 * Returns the available keyring export options.
 * @param {!e2e.openpgp.KeyRingType} keyringType The type of the keyring.
 * @return {!goog.Thenable<e2e.openpgp.KeyringExportOptions>} The available
 *     export options.
 * @export
 */
e2e.openpgp.KeyManager.prototype.getKeyringExportOptions = goog.abstractMethod;


/**
 * Exports the keyring.
 * @param {!e2e.openpgp.KeyRingType} keyringType The type of the keyring.
 * @param {!e2e.openpgp.KeyringExportOptions.<T>} exportOptions The chosen
 *     export options.
 * @return {!goog.Thenable.<T>} The exported keyring.
 * @template T
 * @export
 */
e2e.openpgp.KeyManager.prototype.exportKeyring = goog.abstractMethod;


/**
 * Sets the credentials to use by a given KeyProvider in future calls.
 * @param {!e2e.openpgp.KeyProviderId} providerId Key provider ID.
 * @param {e2e.openpgp.KeyProviderCredentials} credentials The credentials.
 * @return {!goog.Thenable}
 * @export
 */
e2e.openpgp.KeyManager.prototype.setProviderCredentials = goog.abstractMethod;


/**
 * Marks the key(s) as trusted for a given email address. These keys will be
 * then returned in getKeys() calls for that user and the selected purpose(s).
 * Other keys for that email address are implicitly marked as not trusted.
 * The policy for trusting the keys is implemented in the KeyManager of the
 * application.
 * Calling this method might cause UI interaction that lets the KeyProvider
 * manage the trusting process for the keys (e.g. entering a PIN code,
 * confirming an action).
 * The application may optionally pass additional data consumed by the
 * KeyManager / KeyProvider that contain parameters for trusting keys.
 * @param {!e2e.openpgp.Keys} keys The keys to trust.
 * @param {!e2e.openpgp.UserEmail} email The Email address.
 * @param {!e2e.openpgp.KeyPurposeType} purpose The purpose for which
 *     to trust the keys. Invalid purpose for a given key will be ignored.
 * @param {e2e.openpgp.KeyTrustData=} opt_trustData Extra key trust data
 *     containing information for the KeyManager/KeyProviders.
 * @return {!e2e.openpgp.KeysPromise} The keys.
 * @export
 */
e2e.openpgp.KeyManager.prototype.trustKeys = goog.abstractMethod;


/**
 * Tries to unlock a given key. Noop if the key is already unlocked.
 * Calling this method might cause UI interaction from the KeyProvider.
 * Necessary data for interacting with the user (e.g. MessagePorts,
 * callback functions) should be passed in unlockData.
 * @param {!e2e.openpgp.Key} key The key to unlock
 * @param {!e2e.openpgp.KeyUnlockData} unlockData The key unlock data.
 * @return {!e2e.openpgp.KeyPromise} The unlocked Key.
 * @export
 */
e2e.openpgp.KeyManager.prototype.unlockKey = goog.abstractMethod;


/**
 * Removes keys from the KeyProviders.
 * @param {!Array<!e2e.openpgp.Key>} keys
 * @return {!goog.Thenable}
 * @export
 */
e2e.openpgp.KeyManager.prototype.removeKeys = goog.abstractMethod;


/**
 * Imports a binary-encoded OpenPGP key(s) into the Context.
 * All keys from the serialization will be processed.
 * @param {!e2e.ByteArray} keySerialization The key(s) to import.
 * @param {!function(string):!goog.Thenable<string>} passphraseCallback This
 *     callback is used for requesting an action-specific passphrase from the
 *     user (if the key material is encrypted to a passprase).
 * @return {!e2e.openpgp.UserIdsPromise} List of user IDs that were
 *     successfully imported.
 * @export
 */
e2e.openpgp.KeyManager.prototype.importKeys = goog.abstractMethod;
