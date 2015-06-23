<?php
/**
 * Auto generated from ly_message.proto at 2015-06-09 15:36:05
 */

namespace  {
/**
 * ErrCode enum
 */
final class ErrCode
{
    const SUCCESS = 0;
    const ERROR_DATA_ERROR = 1;
    const ERROR_INFO_NOT_COMPLETE = 2;
    const ERROR_NOT_LOGIN = 3;

    /**
     * Returns defined enum values
     *
     * @return int[]
     */
    public function getEnumValues()
    {
        return array(
            'SUCCESS' => self::SUCCESS,
            'ERROR_DATA_ERROR' => self::ERROR_DATA_ERROR,
            'ERROR_INFO_NOT_COMPLETE' => self::ERROR_INFO_NOT_COMPLETE,
            'ERROR_NOT_LOGIN' => self::ERROR_NOT_LOGIN,
        );
    }
}
}

namespace  {
/**
 * ActivityType enum
 */
final class ActivityType
{
    const H5 = 1;
    const POSTLIST = 2;

    /**
     * Returns defined enum values
     *
     * @return int[]
     */
    public function getEnumValues()
    {
        return array(
            'H5' => self::H5,
            'POSTLIST' => self::POSTLIST,
        );
    }
}
}

namespace  {
/**
 * MessageType enum
 */
final class MessageType
{
    const LIKED = 1;
    const COMMENT = 2;

    /**
     * Returns defined enum values
     *
     * @return int[]
     */
    public function getEnumValues()
    {
        return array(
            'LIKED' => self::LIKED,
            'COMMENT' => self::COMMENT,
        );
    }
}
}

namespace  {
/**
 * PostStatus enum
 */
final class PostStatus
{
    const OPENED = 0;
    const DELETED = 1;
    const CLOSED = 2;

    /**
     * Returns defined enum values
     *
     * @return int[]
     */
    public function getEnumValues()
    {
        return array(
            'OPENED' => self::OPENED,
            'DELETED' => self::DELETED,
            'CLOSED' => self::CLOSED,
        );
    }
}
}

namespace  {
/**
 * PushMsgType enum
 */
final class PushMsgType
{
    const SYSTEM = 0;
    const WANNA_JOIN = 1;

    /**
     * Returns defined enum values
     *
     * @return int[]
     */
    public function getEnumValues()
    {
        return array(
            'SYSTEM' => self::SYSTEM,
            'WANNA_JOIN' => self::WANNA_JOIN,
        );
    }
}
}

namespace  {
/**
 * RequestInfo message
 */
class RequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const CLIENT_INFO = 1;
    const LOGIN_INFO = 2;
    const POST_BY_DEST_INFO = 3;
    const POST_BY_USER_INFO = 4;
    const POST_REQ_INFO = 5;
    const POST_ID = 6;
    const USERS_WANNA_JOIN_REQUEST_INFO = 7;
    const USER_INFO = 8;
    const USER_ID = 9;
    const WANNA_JOIN_REQUEST = 10;
    const DATA_UPDATE_REQUEST_INFO = 11;
    const IMG = 12;
    const COMMENT_REQ_INFO = 13;
    const COMMENT_ID = 14;
    const COMMENT_LIST_REQ_INFO = 15;
    const POST_BY_TAG_INFO = 16;
    const PAGE_REQUEST_INFO = 17;
    const FEEDBACK = 101;
    const STATISTICS_DATA = 102;
    const SET_READ_ID = 100;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::CLIENT_INFO => array(
            'name' => 'client_info',
            'required' => true,
            'type' => 'ClientInfo'
        ),
        self::LOGIN_INFO => array(
            'name' => 'login_info',
            'required' => false,
            'type' => 'LoginInfo'
        ),
        self::POST_BY_DEST_INFO => array(
            'name' => 'post_by_dest_info',
            'required' => false,
            'type' => 'PostByDestRequestInfo'
        ),
        self::POST_BY_USER_INFO => array(
            'name' => 'post_by_user_info',
            'required' => false,
            'type' => 'PostByUserRequestInfo'
        ),
        self::POST_REQ_INFO => array(
            'name' => 'post_req_info',
            'required' => false,
            'type' => 'PostRequestInfo'
        ),
        self::POST_ID => array(
            'name' => 'post_id',
            'required' => false,
            'type' => 7,
        ),
        self::USERS_WANNA_JOIN_REQUEST_INFO => array(
            'name' => 'users_wanna_join_request_info',
            'required' => false,
            'type' => 'UsersWannaJoinRequestInfo'
        ),
        self::USER_INFO => array(
            'name' => 'user_info',
            'required' => false,
            'type' => 'UserInfo'
        ),
        self::USER_ID => array(
            'name' => 'user_id',
            'required' => false,
            'type' => 7,
        ),
        self::WANNA_JOIN_REQUEST => array(
            'name' => 'wanna_join_request',
            'required' => false,
            'type' => 'WannaJoinRequest'
        ),
        self::DATA_UPDATE_REQUEST_INFO => array(
            'name' => 'data_update_request_info',
            'required' => false,
            'type' => 'DataUpdateRequestInfo'
        ),
        self::IMG => array(
            'name' => 'img',
            'required' => false,
            'type' => 7,
        ),
        self::COMMENT_REQ_INFO => array(
            'name' => 'comment_req_info',
            'required' => false,
            'type' => 'CommentRequestInfo'
        ),
        self::COMMENT_ID => array(
            'name' => 'comment_id',
            'required' => false,
            'type' => 7,
        ),
        self::COMMENT_LIST_REQ_INFO => array(
            'name' => 'comment_list_req_info',
            'required' => false,
            'type' => 'CommentListRequestInfo'
        ),
        self::POST_BY_TAG_INFO => array(
            'name' => 'post_by_tag_info',
            'required' => false,
            'type' => 'PostByTagRequestInfo'
        ),
        self::PAGE_REQUEST_INFO => array(
            'name' => 'page_request_info',
            'required' => false,
            'type' => 'PageRequestInfo'
        ),
        self::FEEDBACK => array(
            'name' => 'feedback',
            'required' => false,
            'type' => 'Feedback'
        ),
        self::STATISTICS_DATA => array(
            'name' => 'statistics_data',
            'required' => false,
            'type' => 7,
        ),
        self::SET_READ_ID => array(
            'name' => 'set_read_id',
            'repeated' => true,
            'type' => 5,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::CLIENT_INFO] = null;
        $this->values[self::LOGIN_INFO] = null;
        $this->values[self::POST_BY_DEST_INFO] = null;
        $this->values[self::POST_BY_USER_INFO] = null;
        $this->values[self::POST_REQ_INFO] = null;
        $this->values[self::POST_ID] = null;
        $this->values[self::USERS_WANNA_JOIN_REQUEST_INFO] = null;
        $this->values[self::USER_INFO] = null;
        $this->values[self::USER_ID] = null;
        $this->values[self::WANNA_JOIN_REQUEST] = null;
        $this->values[self::DATA_UPDATE_REQUEST_INFO] = null;
        $this->values[self::IMG] = null;
        $this->values[self::COMMENT_REQ_INFO] = null;
        $this->values[self::COMMENT_ID] = null;
        $this->values[self::COMMENT_LIST_REQ_INFO] = null;
        $this->values[self::POST_BY_TAG_INFO] = null;
        $this->values[self::PAGE_REQUEST_INFO] = null;
        $this->values[self::FEEDBACK] = null;
        $this->values[self::STATISTICS_DATA] = null;
        $this->values[self::SET_READ_ID] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'client_info' property
     *
     * @param ClientInfo $value Property value
     *
     * @return null
     */
    public function setClientInfo(ClientInfo $value)
    {
        return $this->set(self::CLIENT_INFO, $value);
    }

    /**
     * Returns value of 'client_info' property
     *
     * @return ClientInfo
     */
    public function getClientInfo()
    {
        return $this->get(self::CLIENT_INFO);
    }

    /**
     * Sets value of 'login_info' property
     *
     * @param LoginInfo $value Property value
     *
     * @return null
     */
    public function setLoginInfo(LoginInfo $value)
    {
        return $this->set(self::LOGIN_INFO, $value);
    }

    /**
     * Returns value of 'login_info' property
     *
     * @return LoginInfo
     */
    public function getLoginInfo()
    {
        return $this->get(self::LOGIN_INFO);
    }

    /**
     * Sets value of 'post_by_dest_info' property
     *
     * @param PostByDestRequestInfo $value Property value
     *
     * @return null
     */
    public function setPostByDestInfo(PostByDestRequestInfo $value)
    {
        return $this->set(self::POST_BY_DEST_INFO, $value);
    }

    /**
     * Returns value of 'post_by_dest_info' property
     *
     * @return PostByDestRequestInfo
     */
    public function getPostByDestInfo()
    {
        return $this->get(self::POST_BY_DEST_INFO);
    }

    /**
     * Sets value of 'post_by_user_info' property
     *
     * @param PostByUserRequestInfo $value Property value
     *
     * @return null
     */
    public function setPostByUserInfo(PostByUserRequestInfo $value)
    {
        return $this->set(self::POST_BY_USER_INFO, $value);
    }

    /**
     * Returns value of 'post_by_user_info' property
     *
     * @return PostByUserRequestInfo
     */
    public function getPostByUserInfo()
    {
        return $this->get(self::POST_BY_USER_INFO);
    }

    /**
     * Sets value of 'post_req_info' property
     *
     * @param PostRequestInfo $value Property value
     *
     * @return null
     */
    public function setPostReqInfo(PostRequestInfo $value)
    {
        return $this->set(self::POST_REQ_INFO, $value);
    }

    /**
     * Returns value of 'post_req_info' property
     *
     * @return PostRequestInfo
     */
    public function getPostReqInfo()
    {
        return $this->get(self::POST_REQ_INFO);
    }

    /**
     * Sets value of 'post_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostId($value)
    {
        return $this->set(self::POST_ID, $value);
    }

    /**
     * Returns value of 'post_id' property
     *
     * @return string
     */
    public function getPostId()
    {
        return $this->get(self::POST_ID);
    }

    /**
     * Sets value of 'users_wanna_join_request_info' property
     *
     * @param UsersWannaJoinRequestInfo $value Property value
     *
     * @return null
     */
    public function setUsersWannaJoinRequestInfo(UsersWannaJoinRequestInfo $value)
    {
        return $this->set(self::USERS_WANNA_JOIN_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'users_wanna_join_request_info' property
     *
     * @return UsersWannaJoinRequestInfo
     */
    public function getUsersWannaJoinRequestInfo()
    {
        return $this->get(self::USERS_WANNA_JOIN_REQUEST_INFO);
    }

    /**
     * Sets value of 'user_info' property
     *
     * @param UserInfo $value Property value
     *
     * @return null
     */
    public function setUserInfo(UserInfo $value)
    {
        return $this->set(self::USER_INFO, $value);
    }

    /**
     * Returns value of 'user_info' property
     *
     * @return UserInfo
     */
    public function getUserInfo()
    {
        return $this->get(self::USER_INFO);
    }

    /**
     * Sets value of 'user_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setUserId($value)
    {
        return $this->set(self::USER_ID, $value);
    }

    /**
     * Returns value of 'user_id' property
     *
     * @return string
     */
    public function getUserId()
    {
        return $this->get(self::USER_ID);
    }

    /**
     * Sets value of 'wanna_join_request' property
     *
     * @param WannaJoinRequest $value Property value
     *
     * @return null
     */
    public function setWannaJoinRequest(WannaJoinRequest $value)
    {
        return $this->set(self::WANNA_JOIN_REQUEST, $value);
    }

    /**
     * Returns value of 'wanna_join_request' property
     *
     * @return WannaJoinRequest
     */
    public function getWannaJoinRequest()
    {
        return $this->get(self::WANNA_JOIN_REQUEST);
    }

    /**
     * Sets value of 'data_update_request_info' property
     *
     * @param DataUpdateRequestInfo $value Property value
     *
     * @return null
     */
    public function setDataUpdateRequestInfo(DataUpdateRequestInfo $value)
    {
        return $this->set(self::DATA_UPDATE_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'data_update_request_info' property
     *
     * @return DataUpdateRequestInfo
     */
    public function getDataUpdateRequestInfo()
    {
        return $this->get(self::DATA_UPDATE_REQUEST_INFO);
    }

    /**
     * Sets value of 'img' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setImg($value)
    {
        return $this->set(self::IMG, $value);
    }

    /**
     * Returns value of 'img' property
     *
     * @return string
     */
    public function getImg()
    {
        return $this->get(self::IMG);
    }

    /**
     * Sets value of 'comment_req_info' property
     *
     * @param CommentRequestInfo $value Property value
     *
     * @return null
     */
    public function setCommentReqInfo(CommentRequestInfo $value)
    {
        return $this->set(self::COMMENT_REQ_INFO, $value);
    }

    /**
     * Returns value of 'comment_req_info' property
     *
     * @return CommentRequestInfo
     */
    public function getCommentReqInfo()
    {
        return $this->get(self::COMMENT_REQ_INFO);
    }

    /**
     * Sets value of 'comment_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setCommentId($value)
    {
        return $this->set(self::COMMENT_ID, $value);
    }

    /**
     * Returns value of 'comment_id' property
     *
     * @return string
     */
    public function getCommentId()
    {
        return $this->get(self::COMMENT_ID);
    }

    /**
     * Sets value of 'comment_list_req_info' property
     *
     * @param CommentListRequestInfo $value Property value
     *
     * @return null
     */
    public function setCommentListReqInfo(CommentListRequestInfo $value)
    {
        return $this->set(self::COMMENT_LIST_REQ_INFO, $value);
    }

    /**
     * Returns value of 'comment_list_req_info' property
     *
     * @return CommentListRequestInfo
     */
    public function getCommentListReqInfo()
    {
        return $this->get(self::COMMENT_LIST_REQ_INFO);
    }

    /**
     * Sets value of 'post_by_tag_info' property
     *
     * @param PostByTagRequestInfo $value Property value
     *
     * @return null
     */
    public function setPostByTagInfo(PostByTagRequestInfo $value)
    {
        return $this->set(self::POST_BY_TAG_INFO, $value);
    }

    /**
     * Returns value of 'post_by_tag_info' property
     *
     * @return PostByTagRequestInfo
     */
    public function getPostByTagInfo()
    {
        return $this->get(self::POST_BY_TAG_INFO);
    }

    /**
     * Sets value of 'page_request_info' property
     *
     * @param PageRequestInfo $value Property value
     *
     * @return null
     */
    public function setPageRequestInfo(PageRequestInfo $value)
    {
        return $this->set(self::PAGE_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'page_request_info' property
     *
     * @return PageRequestInfo
     */
    public function getPageRequestInfo()
    {
        return $this->get(self::PAGE_REQUEST_INFO);
    }

    /**
     * Sets value of 'feedback' property
     *
     * @param Feedback $value Property value
     *
     * @return null
     */
    public function setFeedback(Feedback $value)
    {
        return $this->set(self::FEEDBACK, $value);
    }

    /**
     * Returns value of 'feedback' property
     *
     * @return Feedback
     */
    public function getFeedback()
    {
        return $this->get(self::FEEDBACK);
    }

    /**
     * Sets value of 'statistics_data' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setStatisticsData($value)
    {
        return $this->set(self::STATISTICS_DATA, $value);
    }

    /**
     * Returns value of 'statistics_data' property
     *
     * @return string
     */
    public function getStatisticsData()
    {
        return $this->get(self::STATISTICS_DATA);
    }

    /**
     * Appends value to 'set_read_id' list
     *
     * @param int $value Value to append
     *
     * @return null
     */
    public function appendSetReadId($value)
    {
        return $this->append(self::SET_READ_ID, $value);
    }

    /**
     * Clears 'set_read_id' list
     *
     * @return null
     */
    public function clearSetReadId()
    {
        return $this->clear(self::SET_READ_ID);
    }

    /**
     * Returns 'set_read_id' list
     *
     * @return int[]
     */
    public function getSetReadId()
    {
        return $this->get(self::SET_READ_ID);
    }

    /**
     * Returns 'set_read_id' iterator
     *
     * @return ArrayIterator
     */
    public function getSetReadIdIterator()
    {
        return new \ArrayIterator($this->get(self::SET_READ_ID));
    }

    /**
     * Returns element from 'set_read_id' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return int
     */
    public function getSetReadIdAt($offset)
    {
        return $this->get(self::SET_READ_ID, $offset);
    }

    /**
     * Returns count of 'set_read_id' list
     *
     * @return int
     */
    public function getSetReadIdCount()
    {
        return $this->count(self::SET_READ_ID);
    }
}
}

namespace  {
/**
 * ClientInfo message
 */
class ClientInfo extends \ProtobufMessage
{
    /* Field index constants */
    const CLIENT_VERSION = 1;
    const BUILD_BRAND = 2;
    const BUILD_MODEL = 3;
    const CHANNEL_ID = 4;
    const VERSION_CODE = 5;
    const MID = 6;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::CLIENT_VERSION => array(
            'name' => 'client_version',
            'required' => true,
            'type' => 7,
        ),
        self::BUILD_BRAND => array(
            'name' => 'build_brand',
            'required' => true,
            'type' => 7,
        ),
        self::BUILD_MODEL => array(
            'name' => 'build_model',
            'required' => true,
            'type' => 7,
        ),
        self::CHANNEL_ID => array(
            'name' => 'channel_id',
            'required' => true,
            'type' => 7,
        ),
        self::VERSION_CODE => array(
            'name' => 'version_code',
            'required' => true,
            'type' => 5,
        ),
        self::MID => array(
            'name' => 'mid',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::CLIENT_VERSION] = null;
        $this->values[self::BUILD_BRAND] = null;
        $this->values[self::BUILD_MODEL] = null;
        $this->values[self::CHANNEL_ID] = null;
        $this->values[self::VERSION_CODE] = null;
        $this->values[self::MID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'client_version' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setClientVersion($value)
    {
        return $this->set(self::CLIENT_VERSION, $value);
    }

    /**
     * Returns value of 'client_version' property
     *
     * @return string
     */
    public function getClientVersion()
    {
        return $this->get(self::CLIENT_VERSION);
    }

    /**
     * Sets value of 'build_brand' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setBuildBrand($value)
    {
        return $this->set(self::BUILD_BRAND, $value);
    }

    /**
     * Returns value of 'build_brand' property
     *
     * @return string
     */
    public function getBuildBrand()
    {
        return $this->get(self::BUILD_BRAND);
    }

    /**
     * Sets value of 'build_model' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setBuildModel($value)
    {
        return $this->set(self::BUILD_MODEL, $value);
    }

    /**
     * Returns value of 'build_model' property
     *
     * @return string
     */
    public function getBuildModel()
    {
        return $this->get(self::BUILD_MODEL);
    }

    /**
     * Sets value of 'channel_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setChannelId($value)
    {
        return $this->set(self::CHANNEL_ID, $value);
    }

    /**
     * Returns value of 'channel_id' property
     *
     * @return string
     */
    public function getChannelId()
    {
        return $this->get(self::CHANNEL_ID);
    }

    /**
     * Sets value of 'version_code' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setVersionCode($value)
    {
        return $this->set(self::VERSION_CODE, $value);
    }

    /**
     * Returns value of 'version_code' property
     *
     * @return int
     */
    public function getVersionCode()
    {
        return $this->get(self::VERSION_CODE);
    }

    /**
     * Sets value of 'mid' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setMid($value)
    {
        return $this->set(self::MID, $value);
    }

    /**
     * Returns value of 'mid' property
     *
     * @return string
     */
    public function getMid()
    {
        return $this->get(self::MID);
    }
}
}

namespace  {
/**
 * PostByDestRequestInfo message
 */
class PostByDestRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_REQUEST_INFO = 1;
    const DEST = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_REQUEST_INFO => array(
            'name' => 'page_request_info',
            'required' => true,
            'type' => 'PageRequestInfo'
        ),
        self::DEST => array(
            'name' => 'dest',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_REQUEST_INFO] = null;
        $this->values[self::DEST] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_request_info' property
     *
     * @param PageRequestInfo $value Property value
     *
     * @return null
     */
    public function setPageRequestInfo(PageRequestInfo $value)
    {
        return $this->set(self::PAGE_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'page_request_info' property
     *
     * @return PageRequestInfo
     */
    public function getPageRequestInfo()
    {
        return $this->get(self::PAGE_REQUEST_INFO);
    }

    /**
     * Sets value of 'dest' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setDest($value)
    {
        return $this->set(self::DEST, $value);
    }

    /**
     * Returns value of 'dest' property
     *
     * @return string
     */
    public function getDest()
    {
        return $this->get(self::DEST);
    }
}
}

namespace  {
/**
 * PostByUserRequestInfo message
 */
class PostByUserRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_REQUEST_INFO = 1;
    const UID = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_REQUEST_INFO => array(
            'name' => 'page_request_info',
            'required' => true,
            'type' => 'PageRequestInfo'
        ),
        self::UID => array(
            'name' => 'uid',
            'required' => false,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_REQUEST_INFO] = null;
        $this->values[self::UID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_request_info' property
     *
     * @param PageRequestInfo $value Property value
     *
     * @return null
     */
    public function setPageRequestInfo(PageRequestInfo $value)
    {
        return $this->set(self::PAGE_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'page_request_info' property
     *
     * @return PageRequestInfo
     */
    public function getPageRequestInfo()
    {
        return $this->get(self::PAGE_REQUEST_INFO);
    }

    /**
     * Sets value of 'uid' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setUid($value)
    {
        return $this->set(self::UID, $value);
    }

    /**
     * Returns value of 'uid' property
     *
     * @return string
     */
    public function getUid()
    {
        return $this->get(self::UID);
    }
}
}

namespace  {
/**
 * PostByTagRequestInfo message
 */
class PostByTagRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_REQUEST_INFO = 1;
    const TAG = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_REQUEST_INFO => array(
            'name' => 'page_request_info',
            'required' => true,
            'type' => 'PageRequestInfo'
        ),
        self::TAG => array(
            'name' => 'tag',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_REQUEST_INFO] = null;
        $this->values[self::TAG] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_request_info' property
     *
     * @param PageRequestInfo $value Property value
     *
     * @return null
     */
    public function setPageRequestInfo(PageRequestInfo $value)
    {
        return $this->set(self::PAGE_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'page_request_info' property
     *
     * @return PageRequestInfo
     */
    public function getPageRequestInfo()
    {
        return $this->get(self::PAGE_REQUEST_INFO);
    }

    /**
     * Sets value of 'tag' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setTag($value)
    {
        return $this->set(self::TAG, $value);
    }

    /**
     * Returns value of 'tag' property
     *
     * @return string
     */
    public function getTag()
    {
        return $this->get(self::TAG);
    }
}
}

namespace  {
/**
 * UsersWannaJoinRequestInfo message
 */
class UsersWannaJoinRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_REQUEST_INFO = 1;
    const POST_ID = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_REQUEST_INFO => array(
            'name' => 'page_request_info',
            'required' => true,
            'type' => 'PageRequestInfo'
        ),
        self::POST_ID => array(
            'name' => 'post_id',
            'required' => false,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_REQUEST_INFO] = null;
        $this->values[self::POST_ID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_request_info' property
     *
     * @param PageRequestInfo $value Property value
     *
     * @return null
     */
    public function setPageRequestInfo(PageRequestInfo $value)
    {
        return $this->set(self::PAGE_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'page_request_info' property
     *
     * @return PageRequestInfo
     */
    public function getPageRequestInfo()
    {
        return $this->get(self::PAGE_REQUEST_INFO);
    }

    /**
     * Sets value of 'post_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostId($value)
    {
        return $this->set(self::POST_ID, $value);
    }

    /**
     * Returns value of 'post_id' property
     *
     * @return string
     */
    public function getPostId()
    {
        return $this->get(self::POST_ID);
    }
}
}

namespace  {
/**
 * CommentListRequestInfo message
 */
class CommentListRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_REQUEST_INFO = 1;
    const POST_ID = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_REQUEST_INFO => array(
            'name' => 'page_request_info',
            'required' => true,
            'type' => 'PageRequestInfo'
        ),
        self::POST_ID => array(
            'name' => 'post_id',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_REQUEST_INFO] = null;
        $this->values[self::POST_ID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_request_info' property
     *
     * @param PageRequestInfo $value Property value
     *
     * @return null
     */
    public function setPageRequestInfo(PageRequestInfo $value)
    {
        return $this->set(self::PAGE_REQUEST_INFO, $value);
    }

    /**
     * Returns value of 'page_request_info' property
     *
     * @return PageRequestInfo
     */
    public function getPageRequestInfo()
    {
        return $this->get(self::PAGE_REQUEST_INFO);
    }

    /**
     * Sets value of 'post_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostId($value)
    {
        return $this->set(self::POST_ID, $value);
    }

    /**
     * Returns value of 'post_id' property
     *
     * @return string
     */
    public function getPostId()
    {
        return $this->get(self::POST_ID);
    }
}
}

namespace  {
/**
 * PostRequestInfo message
 */
class PostRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const START_TIME = 1;
    const DURATION = 2;
    const WEIXIN = 3;
    const QQ = 4;
    const PHONE = 5;
    const CONTENT = 6;
    const POST_PLACE = 7;
    const IMGS = 100;
    const DEST_INFO = 101;
    const POST_TAG = 102;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::START_TIME => array(
            'name' => 'start_time',
            'required' => true,
            'type' => 7,
        ),
        self::DURATION => array(
            'name' => 'duration',
            'required' => true,
            'type' => 5,
        ),
        self::WEIXIN => array(
            'name' => 'weixin',
            'required' => true,
            'type' => 7,
        ),
        self::QQ => array(
            'name' => 'qq',
            'required' => true,
            'type' => 7,
        ),
        self::PHONE => array(
            'name' => 'phone',
            'required' => true,
            'type' => 7,
        ),
        self::CONTENT => array(
            'name' => 'content',
            'required' => true,
            'type' => 7,
        ),
        self::POST_PLACE => array(
            'name' => 'post_place',
            'required' => false,
            'type' => 7,
        ),
        self::IMGS => array(
            'name' => 'imgs',
            'repeated' => true,
            'type' => 7,
        ),
        self::DEST_INFO => array(
            'name' => 'dest_info',
            'repeated' => true,
            'type' => 'DestInfo'
        ),
        self::POST_TAG => array(
            'name' => 'post_tag',
            'repeated' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::START_TIME] = null;
        $this->values[self::DURATION] = null;
        $this->values[self::WEIXIN] = null;
        $this->values[self::QQ] = null;
        $this->values[self::PHONE] = null;
        $this->values[self::CONTENT] = null;
        $this->values[self::POST_PLACE] = null;
        $this->values[self::IMGS] = array();
        $this->values[self::DEST_INFO] = array();
        $this->values[self::POST_TAG] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'start_time' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setStartTime($value)
    {
        return $this->set(self::START_TIME, $value);
    }

    /**
     * Returns value of 'start_time' property
     *
     * @return string
     */
    public function getStartTime()
    {
        return $this->get(self::START_TIME);
    }

    /**
     * Sets value of 'duration' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setDuration($value)
    {
        return $this->set(self::DURATION, $value);
    }

    /**
     * Returns value of 'duration' property
     *
     * @return int
     */
    public function getDuration()
    {
        return $this->get(self::DURATION);
    }

    /**
     * Sets value of 'weixin' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setWeixin($value)
    {
        return $this->set(self::WEIXIN, $value);
    }

    /**
     * Returns value of 'weixin' property
     *
     * @return string
     */
    public function getWeixin()
    {
        return $this->get(self::WEIXIN);
    }

    /**
     * Sets value of 'qq' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setQq($value)
    {
        return $this->set(self::QQ, $value);
    }

    /**
     * Returns value of 'qq' property
     *
     * @return string
     */
    public function getQq()
    {
        return $this->get(self::QQ);
    }

    /**
     * Sets value of 'phone' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPhone($value)
    {
        return $this->set(self::PHONE, $value);
    }

    /**
     * Returns value of 'phone' property
     *
     * @return string
     */
    public function getPhone()
    {
        return $this->get(self::PHONE);
    }

    /**
     * Sets value of 'content' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setContent($value)
    {
        return $this->set(self::CONTENT, $value);
    }

    /**
     * Returns value of 'content' property
     *
     * @return string
     */
    public function getContent()
    {
        return $this->get(self::CONTENT);
    }

    /**
     * Sets value of 'post_place' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostPlace($value)
    {
        return $this->set(self::POST_PLACE, $value);
    }

    /**
     * Returns value of 'post_place' property
     *
     * @return string
     */
    public function getPostPlace()
    {
        return $this->get(self::POST_PLACE);
    }

    /**
     * Appends value to 'imgs' list
     *
     * @param string $value Value to append
     *
     * @return null
     */
    public function appendImgs($value)
    {
        return $this->append(self::IMGS, $value);
    }

    /**
     * Clears 'imgs' list
     *
     * @return null
     */
    public function clearImgs()
    {
        return $this->clear(self::IMGS);
    }

    /**
     * Returns 'imgs' list
     *
     * @return string[]
     */
    public function getImgs()
    {
        return $this->get(self::IMGS);
    }

    /**
     * Returns 'imgs' iterator
     *
     * @return ArrayIterator
     */
    public function getImgsIterator()
    {
        return new \ArrayIterator($this->get(self::IMGS));
    }

    /**
     * Returns element from 'imgs' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return string
     */
    public function getImgsAt($offset)
    {
        return $this->get(self::IMGS, $offset);
    }

    /**
     * Returns count of 'imgs' list
     *
     * @return int
     */
    public function getImgsCount()
    {
        return $this->count(self::IMGS);
    }

    /**
     * Appends value to 'dest_info' list
     *
     * @param DestInfo $value Value to append
     *
     * @return null
     */
    public function appendDestInfo(DestInfo $value)
    {
        return $this->append(self::DEST_INFO, $value);
    }

    /**
     * Clears 'dest_info' list
     *
     * @return null
     */
    public function clearDestInfo()
    {
        return $this->clear(self::DEST_INFO);
    }

    /**
     * Returns 'dest_info' list
     *
     * @return DestInfo[]
     */
    public function getDestInfo()
    {
        return $this->get(self::DEST_INFO);
    }

    /**
     * Returns 'dest_info' iterator
     *
     * @return ArrayIterator
     */
    public function getDestInfoIterator()
    {
        return new \ArrayIterator($this->get(self::DEST_INFO));
    }

    /**
     * Returns element from 'dest_info' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return DestInfo
     */
    public function getDestInfoAt($offset)
    {
        return $this->get(self::DEST_INFO, $offset);
    }

    /**
     * Returns count of 'dest_info' list
     *
     * @return int
     */
    public function getDestInfoCount()
    {
        return $this->count(self::DEST_INFO);
    }

    /**
     * Appends value to 'post_tag' list
     *
     * @param string $value Value to append
     *
     * @return null
     */
    public function appendPostTag($value)
    {
        return $this->append(self::POST_TAG, $value);
    }

    /**
     * Clears 'post_tag' list
     *
     * @return null
     */
    public function clearPostTag()
    {
        return $this->clear(self::POST_TAG);
    }

    /**
     * Returns 'post_tag' list
     *
     * @return string[]
     */
    public function getPostTag()
    {
        return $this->get(self::POST_TAG);
    }

    /**
     * Returns 'post_tag' iterator
     *
     * @return ArrayIterator
     */
    public function getPostTagIterator()
    {
        return new \ArrayIterator($this->get(self::POST_TAG));
    }

    /**
     * Returns element from 'post_tag' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return string
     */
    public function getPostTagAt($offset)
    {
        return $this->get(self::POST_TAG, $offset);
    }

    /**
     * Returns count of 'post_tag' list
     *
     * @return int
     */
    public function getPostTagCount()
    {
        return $this->count(self::POST_TAG);
    }
}
}

namespace  {
/**
 * CommentRequestInfo message
 */
class CommentRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const POST_ID = 1;
    const CONTENT = 2;
    const AT_COMMENT_ID = 3;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::POST_ID => array(
            'name' => 'post_id',
            'required' => true,
            'type' => 7,
        ),
        self::CONTENT => array(
            'name' => 'content',
            'required' => true,
            'type' => 7,
        ),
        self::AT_COMMENT_ID => array(
            'name' => 'at_comment_id',
            'required' => false,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::POST_ID] = null;
        $this->values[self::CONTENT] = null;
        $this->values[self::AT_COMMENT_ID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'post_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostId($value)
    {
        return $this->set(self::POST_ID, $value);
    }

    /**
     * Returns value of 'post_id' property
     *
     * @return string
     */
    public function getPostId()
    {
        return $this->get(self::POST_ID);
    }

    /**
     * Sets value of 'content' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setContent($value)
    {
        return $this->set(self::CONTENT, $value);
    }

    /**
     * Returns value of 'content' property
     *
     * @return string
     */
    public function getContent()
    {
        return $this->get(self::CONTENT);
    }

    /**
     * Sets value of 'at_comment_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setAtCommentId($value)
    {
        return $this->set(self::AT_COMMENT_ID, $value);
    }

    /**
     * Returns value of 'at_comment_id' property
     *
     * @return string
     */
    public function getAtCommentId()
    {
        return $this->get(self::AT_COMMENT_ID);
    }
}
}

namespace  {
/**
 * DestInfo message
 */
class DestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const DEST = 1;
    const DEST_ID = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::DEST => array(
            'name' => 'dest',
            'required' => true,
            'type' => 7,
        ),
        self::DEST_ID => array(
            'name' => 'dest_id',
            'required' => false,
            'type' => 5,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::DEST] = null;
        $this->values[self::DEST_ID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'dest' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setDest($value)
    {
        return $this->set(self::DEST, $value);
    }

    /**
     * Returns value of 'dest' property
     *
     * @return string
     */
    public function getDest()
    {
        return $this->get(self::DEST);
    }

    /**
     * Sets value of 'dest_id' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setDestId($value)
    {
        return $this->set(self::DEST_ID, $value);
    }

    /**
     * Returns value of 'dest_id' property
     *
     * @return int
     */
    public function getDestId()
    {
        return $this->get(self::DEST_ID);
    }
}
}

namespace  {
/**
 * LoginInfo message
 */
class LoginInfo extends \ProtobufMessage
{
    /* Field index constants */
    const SESSION_ID = 1;
    const SESSION_TOKEN = 2;
    const PUSH_CLIENT_ID = 3;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::SESSION_ID => array(
            'name' => 'session_id',
            'required' => true,
            'type' => 7,
        ),
        self::SESSION_TOKEN => array(
            'name' => 'session_token',
            'required' => true,
            'type' => 7,
        ),
        self::PUSH_CLIENT_ID => array(
            'name' => 'push_client_id',
            'required' => false,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::SESSION_ID] = null;
        $this->values[self::SESSION_TOKEN] = null;
        $this->values[self::PUSH_CLIENT_ID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'session_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setSessionId($value)
    {
        return $this->set(self::SESSION_ID, $value);
    }

    /**
     * Returns value of 'session_id' property
     *
     * @return string
     */
    public function getSessionId()
    {
        return $this->get(self::SESSION_ID);
    }

    /**
     * Sets value of 'session_token' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setSessionToken($value)
    {
        return $this->set(self::SESSION_TOKEN, $value);
    }

    /**
     * Returns value of 'session_token' property
     *
     * @return string
     */
    public function getSessionToken()
    {
        return $this->get(self::SESSION_TOKEN);
    }

    /**
     * Sets value of 'push_client_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPushClientId($value)
    {
        return $this->set(self::PUSH_CLIENT_ID, $value);
    }

    /**
     * Returns value of 'push_client_id' property
     *
     * @return string
     */
    public function getPushClientId()
    {
        return $this->get(self::PUSH_CLIENT_ID);
    }
}
}

namespace  {
/**
 * PageRequestInfo message
 */
class PageRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const NUM_PER_PAGE = 1;
    const START_OFFSET = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::NUM_PER_PAGE => array(
            'name' => 'num_per_page',
            'required' => true,
            'type' => 5,
        ),
        self::START_OFFSET => array(
            'name' => 'start_offset',
            'required' => true,
            'type' => 5,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::NUM_PER_PAGE] = null;
        $this->values[self::START_OFFSET] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'num_per_page' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setNumPerPage($value)
    {
        return $this->set(self::NUM_PER_PAGE, $value);
    }

    /**
     * Returns value of 'num_per_page' property
     *
     * @return int
     */
    public function getNumPerPage()
    {
        return $this->get(self::NUM_PER_PAGE);
    }

    /**
     * Sets value of 'start_offset' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setStartOffset($value)
    {
        return $this->set(self::START_OFFSET, $value);
    }

    /**
     * Returns value of 'start_offset' property
     *
     * @return int
     */
    public function getStartOffset()
    {
        return $this->get(self::START_OFFSET);
    }
}
}

namespace  {
/**
 * WannaJoinRequest message
 */
class WannaJoinRequest extends \ProtobufMessage
{
    /* Field index constants */
    const POST_ID = 1;
    const STATE = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::POST_ID => array(
            'name' => 'post_id',
            'required' => true,
            'type' => 7,
        ),
        self::STATE => array(
            'name' => 'state',
            'required' => true,
            'type' => 5,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::POST_ID] = null;
        $this->values[self::STATE] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'post_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostId($value)
    {
        return $this->set(self::POST_ID, $value);
    }

    /**
     * Returns value of 'post_id' property
     *
     * @return string
     */
    public function getPostId()
    {
        return $this->get(self::POST_ID);
    }

    /**
     * Sets value of 'state' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setState($value)
    {
        return $this->set(self::STATE, $value);
    }

    /**
     * Returns value of 'state' property
     *
     * @return int
     */
    public function getState()
    {
        return $this->get(self::STATE);
    }
}
}

namespace  {
/**
 * Feedback message
 */
class Feedback extends \ProtobufMessage
{
    /* Field index constants */
    const BUGS = 1;
    const QQ = 2;
    const EMAIL = 3;
    const PHONE = 4;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::BUGS => array(
            'name' => 'bugs',
            'required' => true,
            'type' => 7,
        ),
        self::QQ => array(
            'name' => 'qq',
            'required' => false,
            'type' => 7,
        ),
        self::EMAIL => array(
            'name' => 'email',
            'required' => false,
            'type' => 7,
        ),
        self::PHONE => array(
            'name' => 'phone',
            'required' => false,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::BUGS] = null;
        $this->values[self::QQ] = null;
        $this->values[self::EMAIL] = null;
        $this->values[self::PHONE] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'bugs' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setBugs($value)
    {
        return $this->set(self::BUGS, $value);
    }

    /**
     * Returns value of 'bugs' property
     *
     * @return string
     */
    public function getBugs()
    {
        return $this->get(self::BUGS);
    }

    /**
     * Sets value of 'qq' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setQq($value)
    {
        return $this->set(self::QQ, $value);
    }

    /**
     * Returns value of 'qq' property
     *
     * @return string
     */
    public function getQq()
    {
        return $this->get(self::QQ);
    }

    /**
     * Sets value of 'email' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setEmail($value)
    {
        return $this->set(self::EMAIL, $value);
    }

    /**
     * Returns value of 'email' property
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->get(self::EMAIL);
    }

    /**
     * Sets value of 'phone' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPhone($value)
    {
        return $this->set(self::PHONE, $value);
    }

    /**
     * Returns value of 'phone' property
     *
     * @return string
     */
    public function getPhone()
    {
        return $this->get(self::PHONE);
    }
}
}

namespace  {
/**
 * DataUpdateRequestInfo message
 */
class DataUpdateRequestInfo extends \ProtobufMessage
{
    /* Field index constants */
    const DATA_FILE_NAME = 100;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::DATA_FILE_NAME => array(
            'name' => 'data_file_name',
            'repeated' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::DATA_FILE_NAME] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Appends value to 'data_file_name' list
     *
     * @param string $value Value to append
     *
     * @return null
     */
    public function appendDataFileName($value)
    {
        return $this->append(self::DATA_FILE_NAME, $value);
    }

    /**
     * Clears 'data_file_name' list
     *
     * @return null
     */
    public function clearDataFileName()
    {
        return $this->clear(self::DATA_FILE_NAME);
    }

    /**
     * Returns 'data_file_name' list
     *
     * @return string[]
     */
    public function getDataFileName()
    {
        return $this->get(self::DATA_FILE_NAME);
    }

    /**
     * Returns 'data_file_name' iterator
     *
     * @return ArrayIterator
     */
    public function getDataFileNameIterator()
    {
        return new \ArrayIterator($this->get(self::DATA_FILE_NAME));
    }

    /**
     * Returns element from 'data_file_name' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return string
     */
    public function getDataFileNameAt($offset)
    {
        return $this->get(self::DATA_FILE_NAME, $offset);
    }

    /**
     * Returns count of 'data_file_name' list
     *
     * @return int
     */
    public function getDataFileNameCount()
    {
        return $this->count(self::DATA_FILE_NAME);
    }
}
}

namespace  {
/**
 * ResponseInfo message
 */
class ResponseInfo extends \ProtobufMessage
{
    /* Field index constants */
    const ERR_CODE = 1;
    const POST_INFO_LIST = 2;
    const USER_INFO_LIST = 3;
    const USER_INFO = 4;
    const WANNA_JOIN_RESPONSE = 5;
    const LIKED_MESSAGE_LIST = 6;
    const CLIENT_UPDATE_INFO = 7;
    const DATA_UPDATE_INFO = 8;
    const POST_INFO = 9;
    const POST_OVERVIEW = 10;
    const COMMON_MESSAGE_LIST = 11;
    const POST_COMMENTS = 12;
    const HOT_CITYS = 100;
    const HOT_ACTIVITY = 101;
    const HOT_TRAVEL_TAG = 102;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::ERR_CODE => array(
            'name' => 'err_code',
            'required' => true,
            'type' => 5,
        ),
        self::POST_INFO_LIST => array(
            'name' => 'post_info_list',
            'required' => false,
            'type' => 'PostResponseInfoList'
        ),
        self::USER_INFO_LIST => array(
            'name' => 'user_info_list',
            'required' => false,
            'type' => 'UserInfoList'
        ),
        self::USER_INFO => array(
            'name' => 'user_info',
            'required' => false,
            'type' => 'UserInfo'
        ),
        self::WANNA_JOIN_RESPONSE => array(
            'name' => 'wanna_join_response',
            'required' => false,
            'type' => 'WannaJoinResponse'
        ),
        self::LIKED_MESSAGE_LIST => array(
            'name' => 'liked_message_list',
            'required' => false,
            'type' => 'LikedMessageList'
        ),
        self::CLIENT_UPDATE_INFO => array(
            'name' => 'client_update_info',
            'required' => false,
            'type' => 'ClientUpdateInfo'
        ),
        self::DATA_UPDATE_INFO => array(
            'name' => 'data_update_info',
            'required' => false,
            'type' => 'DataUpdateResponseInfo'
        ),
        self::POST_INFO => array(
            'name' => 'post_info',
            'required' => false,
            'type' => 'PostResponseInfo'
        ),
        self::POST_OVERVIEW => array(
            'name' => 'post_overview',
            'required' => false,
            'type' => 'PostOverview'
        ),
        self::COMMON_MESSAGE_LIST => array(
            'name' => 'common_message_list',
            'required' => false,
            'type' => 'CommonMessageList'
        ),
        self::POST_COMMENTS => array(
            'name' => 'post_comments',
            'required' => false,
            'type' => 'PostComments'
        ),
        self::HOT_CITYS => array(
            'name' => 'hot_citys',
            'repeated' => true,
            'type' => 'HotCity'
        ),
        self::HOT_ACTIVITY => array(
            'name' => 'hot_activity',
            'repeated' => true,
            'type' => 'HotActivity'
        ),
        self::HOT_TRAVEL_TAG => array(
            'name' => 'hot_travel_tag',
            'repeated' => true,
            'type' => 'HotTravelTag'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::ERR_CODE] = null;
        $this->values[self::POST_INFO_LIST] = null;
        $this->values[self::USER_INFO_LIST] = null;
        $this->values[self::USER_INFO] = null;
        $this->values[self::WANNA_JOIN_RESPONSE] = null;
        $this->values[self::LIKED_MESSAGE_LIST] = null;
        $this->values[self::CLIENT_UPDATE_INFO] = null;
        $this->values[self::DATA_UPDATE_INFO] = null;
        $this->values[self::POST_INFO] = null;
        $this->values[self::POST_OVERVIEW] = null;
        $this->values[self::COMMON_MESSAGE_LIST] = null;
        $this->values[self::POST_COMMENTS] = null;
        $this->values[self::HOT_CITYS] = array();
        $this->values[self::HOT_ACTIVITY] = array();
        $this->values[self::HOT_TRAVEL_TAG] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'err_code' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setErrCode($value)
    {
        return $this->set(self::ERR_CODE, $value);
    }

    /**
     * Returns value of 'err_code' property
     *
     * @return int
     */
    public function getErrCode()
    {
        return $this->get(self::ERR_CODE);
    }

    /**
     * Sets value of 'post_info_list' property
     *
     * @param PostResponseInfoList $value Property value
     *
     * @return null
     */
    public function setPostInfoList(PostResponseInfoList $value)
    {
        return $this->set(self::POST_INFO_LIST, $value);
    }

    /**
     * Returns value of 'post_info_list' property
     *
     * @return PostResponseInfoList
     */
    public function getPostInfoList()
    {
        return $this->get(self::POST_INFO_LIST);
    }

    /**
     * Sets value of 'user_info_list' property
     *
     * @param UserInfoList $value Property value
     *
     * @return null
     */
    public function setUserInfoList(UserInfoList $value)
    {
        return $this->set(self::USER_INFO_LIST, $value);
    }

    /**
     * Returns value of 'user_info_list' property
     *
     * @return UserInfoList
     */
    public function getUserInfoList()
    {
        return $this->get(self::USER_INFO_LIST);
    }

    /**
     * Sets value of 'user_info' property
     *
     * @param UserInfo $value Property value
     *
     * @return null
     */
    public function setUserInfo(UserInfo $value)
    {
        return $this->set(self::USER_INFO, $value);
    }

    /**
     * Returns value of 'user_info' property
     *
     * @return UserInfo
     */
    public function getUserInfo()
    {
        return $this->get(self::USER_INFO);
    }

    /**
     * Sets value of 'wanna_join_response' property
     *
     * @param WannaJoinResponse $value Property value
     *
     * @return null
     */
    public function setWannaJoinResponse(WannaJoinResponse $value)
    {
        return $this->set(self::WANNA_JOIN_RESPONSE, $value);
    }

    /**
     * Returns value of 'wanna_join_response' property
     *
     * @return WannaJoinResponse
     */
    public function getWannaJoinResponse()
    {
        return $this->get(self::WANNA_JOIN_RESPONSE);
    }

    /**
     * Sets value of 'liked_message_list' property
     *
     * @param LikedMessageList $value Property value
     *
     * @return null
     */
    public function setLikedMessageList(LikedMessageList $value)
    {
        return $this->set(self::LIKED_MESSAGE_LIST, $value);
    }

    /**
     * Returns value of 'liked_message_list' property
     *
     * @return LikedMessageList
     */
    public function getLikedMessageList()
    {
        return $this->get(self::LIKED_MESSAGE_LIST);
    }

    /**
     * Sets value of 'client_update_info' property
     *
     * @param ClientUpdateInfo $value Property value
     *
     * @return null
     */
    public function setClientUpdateInfo(ClientUpdateInfo $value)
    {
        return $this->set(self::CLIENT_UPDATE_INFO, $value);
    }

    /**
     * Returns value of 'client_update_info' property
     *
     * @return ClientUpdateInfo
     */
    public function getClientUpdateInfo()
    {
        return $this->get(self::CLIENT_UPDATE_INFO);
    }

    /**
     * Sets value of 'data_update_info' property
     *
     * @param DataUpdateResponseInfo $value Property value
     *
     * @return null
     */
    public function setDataUpdateInfo(DataUpdateResponseInfo $value)
    {
        return $this->set(self::DATA_UPDATE_INFO, $value);
    }

    /**
     * Returns value of 'data_update_info' property
     *
     * @return DataUpdateResponseInfo
     */
    public function getDataUpdateInfo()
    {
        return $this->get(self::DATA_UPDATE_INFO);
    }

    /**
     * Sets value of 'post_info' property
     *
     * @param PostResponseInfo $value Property value
     *
     * @return null
     */
    public function setPostInfo(PostResponseInfo $value)
    {
        return $this->set(self::POST_INFO, $value);
    }

    /**
     * Returns value of 'post_info' property
     *
     * @return PostResponseInfo
     */
    public function getPostInfo()
    {
        return $this->get(self::POST_INFO);
    }

    /**
     * Sets value of 'post_overview' property
     *
     * @param PostOverview $value Property value
     *
     * @return null
     */
    public function setPostOverview(PostOverview $value)
    {
        return $this->set(self::POST_OVERVIEW, $value);
    }

    /**
     * Returns value of 'post_overview' property
     *
     * @return PostOverview
     */
    public function getPostOverview()
    {
        return $this->get(self::POST_OVERVIEW);
    }

    /**
     * Sets value of 'common_message_list' property
     *
     * @param CommonMessageList $value Property value
     *
     * @return null
     */
    public function setCommonMessageList(CommonMessageList $value)
    {
        return $this->set(self::COMMON_MESSAGE_LIST, $value);
    }

    /**
     * Returns value of 'common_message_list' property
     *
     * @return CommonMessageList
     */
    public function getCommonMessageList()
    {
        return $this->get(self::COMMON_MESSAGE_LIST);
    }

    /**
     * Sets value of 'post_comments' property
     *
     * @param PostComments $value Property value
     *
     * @return null
     */
    public function setPostComments(PostComments $value)
    {
        return $this->set(self::POST_COMMENTS, $value);
    }

    /**
     * Returns value of 'post_comments' property
     *
     * @return PostComments
     */
    public function getPostComments()
    {
        return $this->get(self::POST_COMMENTS);
    }

    /**
     * Appends value to 'hot_citys' list
     *
     * @param HotCity $value Value to append
     *
     * @return null
     */
    public function appendHotCitys(HotCity $value)
    {
        return $this->append(self::HOT_CITYS, $value);
    }

    /**
     * Clears 'hot_citys' list
     *
     * @return null
     */
    public function clearHotCitys()
    {
        return $this->clear(self::HOT_CITYS);
    }

    /**
     * Returns 'hot_citys' list
     *
     * @return HotCity[]
     */
    public function getHotCitys()
    {
        return $this->get(self::HOT_CITYS);
    }

    /**
     * Returns 'hot_citys' iterator
     *
     * @return ArrayIterator
     */
    public function getHotCitysIterator()
    {
        return new \ArrayIterator($this->get(self::HOT_CITYS));
    }

    /**
     * Returns element from 'hot_citys' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return HotCity
     */
    public function getHotCitysAt($offset)
    {
        return $this->get(self::HOT_CITYS, $offset);
    }

    /**
     * Returns count of 'hot_citys' list
     *
     * @return int
     */
    public function getHotCitysCount()
    {
        return $this->count(self::HOT_CITYS);
    }

    /**
     * Appends value to 'hot_activity' list
     *
     * @param HotActivity $value Value to append
     *
     * @return null
     */
    public function appendHotActivity(HotActivity $value)
    {
        return $this->append(self::HOT_ACTIVITY, $value);
    }

    /**
     * Clears 'hot_activity' list
     *
     * @return null
     */
    public function clearHotActivity()
    {
        return $this->clear(self::HOT_ACTIVITY);
    }

    /**
     * Returns 'hot_activity' list
     *
     * @return HotActivity[]
     */
    public function getHotActivity()
    {
        return $this->get(self::HOT_ACTIVITY);
    }

    /**
     * Returns 'hot_activity' iterator
     *
     * @return ArrayIterator
     */
    public function getHotActivityIterator()
    {
        return new \ArrayIterator($this->get(self::HOT_ACTIVITY));
    }

    /**
     * Returns element from 'hot_activity' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return HotActivity
     */
    public function getHotActivityAt($offset)
    {
        return $this->get(self::HOT_ACTIVITY, $offset);
    }

    /**
     * Returns count of 'hot_activity' list
     *
     * @return int
     */
    public function getHotActivityCount()
    {
        return $this->count(self::HOT_ACTIVITY);
    }

    /**
     * Appends value to 'hot_travel_tag' list
     *
     * @param HotTravelTag $value Value to append
     *
     * @return null
     */
    public function appendHotTravelTag(HotTravelTag $value)
    {
        return $this->append(self::HOT_TRAVEL_TAG, $value);
    }

    /**
     * Clears 'hot_travel_tag' list
     *
     * @return null
     */
    public function clearHotTravelTag()
    {
        return $this->clear(self::HOT_TRAVEL_TAG);
    }

    /**
     * Returns 'hot_travel_tag' list
     *
     * @return HotTravelTag[]
     */
    public function getHotTravelTag()
    {
        return $this->get(self::HOT_TRAVEL_TAG);
    }

    /**
     * Returns 'hot_travel_tag' iterator
     *
     * @return ArrayIterator
     */
    public function getHotTravelTagIterator()
    {
        return new \ArrayIterator($this->get(self::HOT_TRAVEL_TAG));
    }

    /**
     * Returns element from 'hot_travel_tag' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return HotTravelTag
     */
    public function getHotTravelTagAt($offset)
    {
        return $this->get(self::HOT_TRAVEL_TAG, $offset);
    }

    /**
     * Returns count of 'hot_travel_tag' list
     *
     * @return int
     */
    public function getHotTravelTagCount()
    {
        return $this->count(self::HOT_TRAVEL_TAG);
    }
}
}

namespace  {
/**
 * HotCity message
 */
class HotCity extends \ProtobufMessage
{
    /* Field index constants */
    const URL = 1;
    const NAME = 2;
    const DESC = 3;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::URL => array(
            'name' => 'url',
            'required' => true,
            'type' => 7,
        ),
        self::NAME => array(
            'name' => 'name',
            'required' => true,
            'type' => 7,
        ),
        self::DESC => array(
            'name' => 'desc',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::URL] = null;
        $this->values[self::NAME] = null;
        $this->values[self::DESC] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'url' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setUrl($value)
    {
        return $this->set(self::URL, $value);
    }

    /**
     * Returns value of 'url' property
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->get(self::URL);
    }

    /**
     * Sets value of 'name' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setName($value)
    {
        return $this->set(self::NAME, $value);
    }

    /**
     * Returns value of 'name' property
     *
     * @return string
     */
    public function getName()
    {
        return $this->get(self::NAME);
    }

    /**
     * Sets value of 'desc' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setDesc($value)
    {
        return $this->set(self::DESC, $value);
    }

    /**
     * Returns value of 'desc' property
     *
     * @return string
     */
    public function getDesc()
    {
        return $this->get(self::DESC);
    }
}
}

namespace  {
/**
 * HotActivity message
 */
class HotActivity extends \ProtobufMessage
{
    /* Field index constants */
    const NAME = 1;
    const URL = 2;
    const IMG_URL = 3;
    const TYPE = 4;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::NAME => array(
            'name' => 'name',
            'required' => true,
            'type' => 7,
        ),
        self::URL => array(
            'name' => 'url',
            'required' => true,
            'type' => 7,
        ),
        self::IMG_URL => array(
            'name' => 'img_url',
            'required' => true,
            'type' => 7,
        ),
        self::TYPE => array(
            'name' => 'type',
            'required' => true,
            'type' => 5,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::NAME] = null;
        $this->values[self::URL] = null;
        $this->values[self::IMG_URL] = null;
        $this->values[self::TYPE] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'name' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setName($value)
    {
        return $this->set(self::NAME, $value);
    }

    /**
     * Returns value of 'name' property
     *
     * @return string
     */
    public function getName()
    {
        return $this->get(self::NAME);
    }

    /**
     * Sets value of 'url' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setUrl($value)
    {
        return $this->set(self::URL, $value);
    }

    /**
     * Returns value of 'url' property
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->get(self::URL);
    }

    /**
     * Sets value of 'img_url' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setImgUrl($value)
    {
        return $this->set(self::IMG_URL, $value);
    }

    /**
     * Returns value of 'img_url' property
     *
     * @return string
     */
    public function getImgUrl()
    {
        return $this->get(self::IMG_URL);
    }

    /**
     * Sets value of 'type' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setType($value)
    {
        return $this->set(self::TYPE, $value);
    }

    /**
     * Returns value of 'type' property
     *
     * @return int
     */
    public function getType()
    {
        return $this->get(self::TYPE);
    }
}
}

namespace  {
/**
 * HotTravelTag message
 */
class HotTravelTag extends \ProtobufMessage
{
    /* Field index constants */
    const TAG = 1;
    const IMG_URL = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::TAG => array(
            'name' => 'tag',
            'required' => true,
            'type' => 7,
        ),
        self::IMG_URL => array(
            'name' => 'img_url',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::TAG] = null;
        $this->values[self::IMG_URL] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'tag' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setTag($value)
    {
        return $this->set(self::TAG, $value);
    }

    /**
     * Returns value of 'tag' property
     *
     * @return string
     */
    public function getTag()
    {
        return $this->get(self::TAG);
    }

    /**
     * Sets value of 'img_url' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setImgUrl($value)
    {
        return $this->set(self::IMG_URL, $value);
    }

    /**
     * Returns value of 'img_url' property
     *
     * @return string
     */
    public function getImgUrl()
    {
        return $this->get(self::IMG_URL);
    }
}
}

namespace  {
/**
 * PostResponseInfoList message
 */
class PostResponseInfoList extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_RESPONSE_INFO = 1;
    const POST_INFOS = 100;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_RESPONSE_INFO => array(
            'name' => 'page_response_info',
            'required' => true,
            'type' => 'PageResponseInfo'
        ),
        self::POST_INFOS => array(
            'name' => 'post_infos',
            'repeated' => true,
            'type' => 'PostResponseInfo'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_RESPONSE_INFO] = null;
        $this->values[self::POST_INFOS] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_response_info' property
     *
     * @param PageResponseInfo $value Property value
     *
     * @return null
     */
    public function setPageResponseInfo(PageResponseInfo $value)
    {
        return $this->set(self::PAGE_RESPONSE_INFO, $value);
    }

    /**
     * Returns value of 'page_response_info' property
     *
     * @return PageResponseInfo
     */
    public function getPageResponseInfo()
    {
        return $this->get(self::PAGE_RESPONSE_INFO);
    }

    /**
     * Appends value to 'post_infos' list
     *
     * @param PostResponseInfo $value Value to append
     *
     * @return null
     */
    public function appendPostInfos(PostResponseInfo $value)
    {
        return $this->append(self::POST_INFOS, $value);
    }

    /**
     * Clears 'post_infos' list
     *
     * @return null
     */
    public function clearPostInfos()
    {
        return $this->clear(self::POST_INFOS);
    }

    /**
     * Returns 'post_infos' list
     *
     * @return PostResponseInfo[]
     */
    public function getPostInfos()
    {
        return $this->get(self::POST_INFOS);
    }

    /**
     * Returns 'post_infos' iterator
     *
     * @return ArrayIterator
     */
    public function getPostInfosIterator()
    {
        return new \ArrayIterator($this->get(self::POST_INFOS));
    }

    /**
     * Returns element from 'post_infos' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return PostResponseInfo
     */
    public function getPostInfosAt($offset)
    {
        return $this->get(self::POST_INFOS, $offset);
    }

    /**
     * Returns count of 'post_infos' list
     *
     * @return int
     */
    public function getPostInfosCount()
    {
        return $this->count(self::POST_INFOS);
    }
}
}

namespace  {
/**
 * PostResponseInfo message
 */
class PostResponseInfo extends \ProtobufMessage
{
    /* Field index constants */
    const ID = 1;
    const UID = 2;
    const CREATED_TIME = 3;
    const DAYS = 4;
    const WEIXIN = 5;
    const QQ = 6;
    const PHONE = 7;
    const CONTENT = 8;
    const POST_PLACE = 9;
    const START_TIME = 10;
    const FINISH_TIME = 11;
    const DEST = 12;
    const IS_MY = 13;
    const IS_LIKED = 14;
    const LIKE_NUM = 15;
    const USER_INFO = 16;
    const STATUS = 17;
    const PV = 18;
    const IMGS = 100;
    const POST_TAG = 101;
    const POST_DETAIL_INFO = 19;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::ID => array(
            'name' => 'id',
            'required' => true,
            'type' => 7,
        ),
        self::UID => array(
            'name' => 'uid',
            'required' => true,
            'type' => 7,
        ),
        self::CREATED_TIME => array(
            'name' => 'created_time',
            'required' => true,
            'type' => 7,
        ),
        self::DAYS => array(
            'name' => 'days',
            'required' => true,
            'type' => 7,
        ),
        self::WEIXIN => array(
            'name' => 'weixin',
            'required' => true,
            'type' => 7,
        ),
        self::QQ => array(
            'name' => 'qq',
            'required' => true,
            'type' => 7,
        ),
        self::PHONE => array(
            'name' => 'phone',
            'required' => true,
            'type' => 7,
        ),
        self::CONTENT => array(
            'name' => 'content',
            'required' => true,
            'type' => 7,
        ),
        self::POST_PLACE => array(
            'name' => 'post_place',
            'required' => true,
            'type' => 7,
        ),
        self::START_TIME => array(
            'name' => 'start_time',
            'required' => true,
            'type' => 7,
        ),
        self::FINISH_TIME => array(
            'name' => 'finish_time',
            'required' => true,
            'type' => 7,
        ),
        self::DEST => array(
            'name' => 'dest',
            'required' => true,
            'type' => 7,
        ),
        self::IS_MY => array(
            'name' => 'is_my',
            'required' => true,
            'type' => 8,
        ),
        self::IS_LIKED => array(
            'name' => 'is_liked',
            'required' => true,
            'type' => 8,
        ),
        self::LIKE_NUM => array(
            'name' => 'like_num',
            'required' => true,
            'type' => 5,
        ),
        self::USER_INFO => array(
            'name' => 'user_info',
            'required' => true,
            'type' => 'UserInfo'
        ),
        self::STATUS => array(
            'name' => 'status',
            'required' => true,
            'type' => 5,
        ),
        self::PV => array(
            'name' => 'pv',
            'required' => true,
            'type' => 5,
        ),
        self::IMGS => array(
            'name' => 'imgs',
            'repeated' => true,
            'type' => 'PostImg'
        ),
        self::POST_TAG => array(
            'name' => 'post_tag',
            'repeated' => true,
            'type' => 7,
        ),
        self::POST_DETAIL_INFO => array(
            'name' => 'post_detail_info',
            'required' => false,
            'type' => 'PostDetailInfo'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::ID] = null;
        $this->values[self::UID] = null;
        $this->values[self::CREATED_TIME] = null;
        $this->values[self::DAYS] = null;
        $this->values[self::WEIXIN] = null;
        $this->values[self::QQ] = null;
        $this->values[self::PHONE] = null;
        $this->values[self::CONTENT] = null;
        $this->values[self::POST_PLACE] = null;
        $this->values[self::START_TIME] = null;
        $this->values[self::FINISH_TIME] = null;
        $this->values[self::DEST] = null;
        $this->values[self::IS_MY] = null;
        $this->values[self::IS_LIKED] = null;
        $this->values[self::LIKE_NUM] = null;
        $this->values[self::USER_INFO] = null;
        $this->values[self::STATUS] = null;
        $this->values[self::PV] = null;
        $this->values[self::IMGS] = array();
        $this->values[self::POST_TAG] = array();
        $this->values[self::POST_DETAIL_INFO] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setId($value)
    {
        return $this->set(self::ID, $value);
    }

    /**
     * Returns value of 'id' property
     *
     * @return string
     */
    public function getId()
    {
        return $this->get(self::ID);
    }

    /**
     * Sets value of 'uid' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setUid($value)
    {
        return $this->set(self::UID, $value);
    }

    /**
     * Returns value of 'uid' property
     *
     * @return string
     */
    public function getUid()
    {
        return $this->get(self::UID);
    }

    /**
     * Sets value of 'created_time' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setCreatedTime($value)
    {
        return $this->set(self::CREATED_TIME, $value);
    }

    /**
     * Returns value of 'created_time' property
     *
     * @return string
     */
    public function getCreatedTime()
    {
        return $this->get(self::CREATED_TIME);
    }

    /**
     * Sets value of 'days' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setDays($value)
    {
        return $this->set(self::DAYS, $value);
    }

    /**
     * Returns value of 'days' property
     *
     * @return string
     */
    public function getDays()
    {
        return $this->get(self::DAYS);
    }

    /**
     * Sets value of 'weixin' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setWeixin($value)
    {
        return $this->set(self::WEIXIN, $value);
    }

    /**
     * Returns value of 'weixin' property
     *
     * @return string
     */
    public function getWeixin()
    {
        return $this->get(self::WEIXIN);
    }

    /**
     * Sets value of 'qq' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setQq($value)
    {
        return $this->set(self::QQ, $value);
    }

    /**
     * Returns value of 'qq' property
     *
     * @return string
     */
    public function getQq()
    {
        return $this->get(self::QQ);
    }

    /**
     * Sets value of 'phone' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPhone($value)
    {
        return $this->set(self::PHONE, $value);
    }

    /**
     * Returns value of 'phone' property
     *
     * @return string
     */
    public function getPhone()
    {
        return $this->get(self::PHONE);
    }

    /**
     * Sets value of 'content' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setContent($value)
    {
        return $this->set(self::CONTENT, $value);
    }

    /**
     * Returns value of 'content' property
     *
     * @return string
     */
    public function getContent()
    {
        return $this->get(self::CONTENT);
    }

    /**
     * Sets value of 'post_place' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostPlace($value)
    {
        return $this->set(self::POST_PLACE, $value);
    }

    /**
     * Returns value of 'post_place' property
     *
     * @return string
     */
    public function getPostPlace()
    {
        return $this->get(self::POST_PLACE);
    }

    /**
     * Sets value of 'start_time' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setStartTime($value)
    {
        return $this->set(self::START_TIME, $value);
    }

    /**
     * Returns value of 'start_time' property
     *
     * @return string
     */
    public function getStartTime()
    {
        return $this->get(self::START_TIME);
    }

    /**
     * Sets value of 'finish_time' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setFinishTime($value)
    {
        return $this->set(self::FINISH_TIME, $value);
    }

    /**
     * Returns value of 'finish_time' property
     *
     * @return string
     */
    public function getFinishTime()
    {
        return $this->get(self::FINISH_TIME);
    }

    /**
     * Sets value of 'dest' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setDest($value)
    {
        return $this->set(self::DEST, $value);
    }

    /**
     * Returns value of 'dest' property
     *
     * @return string
     */
    public function getDest()
    {
        return $this->get(self::DEST);
    }

    /**
     * Sets value of 'is_my' property
     *
     * @param bool $value Property value
     *
     * @return null
     */
    public function setIsMy($value)
    {
        return $this->set(self::IS_MY, $value);
    }

    /**
     * Returns value of 'is_my' property
     *
     * @return bool
     */
    public function getIsMy()
    {
        return $this->get(self::IS_MY);
    }

    /**
     * Sets value of 'is_liked' property
     *
     * @param bool $value Property value
     *
     * @return null
     */
    public function setIsLiked($value)
    {
        return $this->set(self::IS_LIKED, $value);
    }

    /**
     * Returns value of 'is_liked' property
     *
     * @return bool
     */
    public function getIsLiked()
    {
        return $this->get(self::IS_LIKED);
    }

    /**
     * Sets value of 'like_num' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setLikeNum($value)
    {
        return $this->set(self::LIKE_NUM, $value);
    }

    /**
     * Returns value of 'like_num' property
     *
     * @return int
     */
    public function getLikeNum()
    {
        return $this->get(self::LIKE_NUM);
    }

    /**
     * Sets value of 'user_info' property
     *
     * @param UserInfo $value Property value
     *
     * @return null
     */
    public function setUserInfo(UserInfo $value)
    {
        return $this->set(self::USER_INFO, $value);
    }

    /**
     * Returns value of 'user_info' property
     *
     * @return UserInfo
     */
    public function getUserInfo()
    {
        return $this->get(self::USER_INFO);
    }

    /**
     * Sets value of 'status' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setStatus($value)
    {
        return $this->set(self::STATUS, $value);
    }

    /**
     * Returns value of 'status' property
     *
     * @return int
     */
    public function getStatus()
    {
        return $this->get(self::STATUS);
    }

    /**
     * Sets value of 'pv' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setPv($value)
    {
        return $this->set(self::PV, $value);
    }

    /**
     * Returns value of 'pv' property
     *
     * @return int
     */
    public function getPv()
    {
        return $this->get(self::PV);
    }

    /**
     * Appends value to 'imgs' list
     *
     * @param PostImg $value Value to append
     *
     * @return null
     */
    public function appendImgs(PostImg $value)
    {
        return $this->append(self::IMGS, $value);
    }

    /**
     * Clears 'imgs' list
     *
     * @return null
     */
    public function clearImgs()
    {
        return $this->clear(self::IMGS);
    }

    /**
     * Returns 'imgs' list
     *
     * @return PostImg[]
     */
    public function getImgs()
    {
        return $this->get(self::IMGS);
    }

    /**
     * Returns 'imgs' iterator
     *
     * @return ArrayIterator
     */
    public function getImgsIterator()
    {
        return new \ArrayIterator($this->get(self::IMGS));
    }

    /**
     * Returns element from 'imgs' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return PostImg
     */
    public function getImgsAt($offset)
    {
        return $this->get(self::IMGS, $offset);
    }

    /**
     * Returns count of 'imgs' list
     *
     * @return int
     */
    public function getImgsCount()
    {
        return $this->count(self::IMGS);
    }

    /**
     * Appends value to 'post_tag' list
     *
     * @param string $value Value to append
     *
     * @return null
     */
    public function appendPostTag($value)
    {
        return $this->append(self::POST_TAG, $value);
    }

    /**
     * Clears 'post_tag' list
     *
     * @return null
     */
    public function clearPostTag()
    {
        return $this->clear(self::POST_TAG);
    }

    /**
     * Returns 'post_tag' list
     *
     * @return string[]
     */
    public function getPostTag()
    {
        return $this->get(self::POST_TAG);
    }

    /**
     * Returns 'post_tag' iterator
     *
     * @return ArrayIterator
     */
    public function getPostTagIterator()
    {
        return new \ArrayIterator($this->get(self::POST_TAG));
    }

    /**
     * Returns element from 'post_tag' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return string
     */
    public function getPostTagAt($offset)
    {
        return $this->get(self::POST_TAG, $offset);
    }

    /**
     * Returns count of 'post_tag' list
     *
     * @return int
     */
    public function getPostTagCount()
    {
        return $this->count(self::POST_TAG);
    }

    /**
     * Sets value of 'post_detail_info' property
     *
     * @param PostDetailInfo $value Property value
     *
     * @return null
     */
    public function setPostDetailInfo(PostDetailInfo $value)
    {
        return $this->set(self::POST_DETAIL_INFO, $value);
    }

    /**
     * Returns value of 'post_detail_info' property
     *
     * @return PostDetailInfo
     */
    public function getPostDetailInfo()
    {
        return $this->get(self::POST_DETAIL_INFO);
    }
}
}

namespace  {
/**
 * PostDetailInfo message
 */
class PostDetailInfo extends \ProtobufMessage
{
    /* Field index constants */
    const SHARE_INFO = 1;
    const LIKED_MESSAGE = 100;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::SHARE_INFO => array(
            'name' => 'share_info',
            'required' => true,
            'type' => 'ShareInfo'
        ),
        self::LIKED_MESSAGE => array(
            'name' => 'liked_message',
            'repeated' => true,
            'type' => 'LikedMessage'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::SHARE_INFO] = null;
        $this->values[self::LIKED_MESSAGE] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'share_info' property
     *
     * @param ShareInfo $value Property value
     *
     * @return null
     */
    public function setShareInfo(ShareInfo $value)
    {
        return $this->set(self::SHARE_INFO, $value);
    }

    /**
     * Returns value of 'share_info' property
     *
     * @return ShareInfo
     */
    public function getShareInfo()
    {
        return $this->get(self::SHARE_INFO);
    }

    /**
     * Appends value to 'liked_message' list
     *
     * @param LikedMessage $value Value to append
     *
     * @return null
     */
    public function appendLikedMessage(LikedMessage $value)
    {
        return $this->append(self::LIKED_MESSAGE, $value);
    }

    /**
     * Clears 'liked_message' list
     *
     * @return null
     */
    public function clearLikedMessage()
    {
        return $this->clear(self::LIKED_MESSAGE);
    }

    /**
     * Returns 'liked_message' list
     *
     * @return LikedMessage[]
     */
    public function getLikedMessage()
    {
        return $this->get(self::LIKED_MESSAGE);
    }

    /**
     * Returns 'liked_message' iterator
     *
     * @return ArrayIterator
     */
    public function getLikedMessageIterator()
    {
        return new \ArrayIterator($this->get(self::LIKED_MESSAGE));
    }

    /**
     * Returns element from 'liked_message' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return LikedMessage
     */
    public function getLikedMessageAt($offset)
    {
        return $this->get(self::LIKED_MESSAGE, $offset);
    }

    /**
     * Returns count of 'liked_message' list
     *
     * @return int
     */
    public function getLikedMessageCount()
    {
        return $this->count(self::LIKED_MESSAGE);
    }
}
}

namespace  {
/**
 * PostComments message
 */
class PostComments extends \ProtobufMessage
{
    /* Field index constants */
    const TOTAL_NUM = 1;
    const PAGE_RESPONSE_INFO = 2;
    const COMMENT_INFO = 100;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::TOTAL_NUM => array(
            'name' => 'total_num',
            'required' => true,
            'type' => 5,
        ),
        self::PAGE_RESPONSE_INFO => array(
            'name' => 'page_response_info',
            'required' => true,
            'type' => 'PageResponseInfo'
        ),
        self::COMMENT_INFO => array(
            'name' => 'comment_info',
            'repeated' => true,
            'type' => 'CommentRespInfo'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::TOTAL_NUM] = null;
        $this->values[self::PAGE_RESPONSE_INFO] = null;
        $this->values[self::COMMENT_INFO] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'total_num' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setTotalNum($value)
    {
        return $this->set(self::TOTAL_NUM, $value);
    }

    /**
     * Returns value of 'total_num' property
     *
     * @return int
     */
    public function getTotalNum()
    {
        return $this->get(self::TOTAL_NUM);
    }

    /**
     * Sets value of 'page_response_info' property
     *
     * @param PageResponseInfo $value Property value
     *
     * @return null
     */
    public function setPageResponseInfo(PageResponseInfo $value)
    {
        return $this->set(self::PAGE_RESPONSE_INFO, $value);
    }

    /**
     * Returns value of 'page_response_info' property
     *
     * @return PageResponseInfo
     */
    public function getPageResponseInfo()
    {
        return $this->get(self::PAGE_RESPONSE_INFO);
    }

    /**
     * Appends value to 'comment_info' list
     *
     * @param CommentRespInfo $value Value to append
     *
     * @return null
     */
    public function appendCommentInfo(CommentRespInfo $value)
    {
        return $this->append(self::COMMENT_INFO, $value);
    }

    /**
     * Clears 'comment_info' list
     *
     * @return null
     */
    public function clearCommentInfo()
    {
        return $this->clear(self::COMMENT_INFO);
    }

    /**
     * Returns 'comment_info' list
     *
     * @return CommentRespInfo[]
     */
    public function getCommentInfo()
    {
        return $this->get(self::COMMENT_INFO);
    }

    /**
     * Returns 'comment_info' iterator
     *
     * @return ArrayIterator
     */
    public function getCommentInfoIterator()
    {
        return new \ArrayIterator($this->get(self::COMMENT_INFO));
    }

    /**
     * Returns element from 'comment_info' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return CommentRespInfo
     */
    public function getCommentInfoAt($offset)
    {
        return $this->get(self::COMMENT_INFO, $offset);
    }

    /**
     * Returns count of 'comment_info' list
     *
     * @return int
     */
    public function getCommentInfoCount()
    {
        return $this->count(self::COMMENT_INFO);
    }
}
}

namespace  {
/**
 * CommentRespInfo message
 */
class CommentRespInfo extends \ProtobufMessage
{
    /* Field index constants */
    const ID = 1;
    const USER_INFO = 2;
    const COMMENT_TIME = 3;
    const CONTENT = 4;
    const AT_UID = 5;
    const AT_NICK_NAME = 6;
    const IS_MY = 7;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::ID => array(
            'name' => 'id',
            'required' => true,
            'type' => 7,
        ),
        self::USER_INFO => array(
            'name' => 'user_info',
            'required' => true,
            'type' => 'UserInfo'
        ),
        self::COMMENT_TIME => array(
            'name' => 'comment_time',
            'required' => true,
            'type' => 7,
        ),
        self::CONTENT => array(
            'name' => 'content',
            'required' => true,
            'type' => 7,
        ),
        self::AT_UID => array(
            'name' => 'at_uid',
            'required' => false,
            'type' => 7,
        ),
        self::AT_NICK_NAME => array(
            'name' => 'at_nick_name',
            'required' => false,
            'type' => 7,
        ),
        self::IS_MY => array(
            'name' => 'is_my',
            'required' => false,
            'type' => 8,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::ID] = null;
        $this->values[self::USER_INFO] = null;
        $this->values[self::COMMENT_TIME] = null;
        $this->values[self::CONTENT] = null;
        $this->values[self::AT_UID] = null;
        $this->values[self::AT_NICK_NAME] = null;
        $this->values[self::IS_MY] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setId($value)
    {
        return $this->set(self::ID, $value);
    }

    /**
     * Returns value of 'id' property
     *
     * @return string
     */
    public function getId()
    {
        return $this->get(self::ID);
    }

    /**
     * Sets value of 'user_info' property
     *
     * @param UserInfo $value Property value
     *
     * @return null
     */
    public function setUserInfo(UserInfo $value)
    {
        return $this->set(self::USER_INFO, $value);
    }

    /**
     * Returns value of 'user_info' property
     *
     * @return UserInfo
     */
    public function getUserInfo()
    {
        return $this->get(self::USER_INFO);
    }

    /**
     * Sets value of 'comment_time' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setCommentTime($value)
    {
        return $this->set(self::COMMENT_TIME, $value);
    }

    /**
     * Returns value of 'comment_time' property
     *
     * @return string
     */
    public function getCommentTime()
    {
        return $this->get(self::COMMENT_TIME);
    }

    /**
     * Sets value of 'content' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setContent($value)
    {
        return $this->set(self::CONTENT, $value);
    }

    /**
     * Returns value of 'content' property
     *
     * @return string
     */
    public function getContent()
    {
        return $this->get(self::CONTENT);
    }

    /**
     * Sets value of 'at_uid' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setAtUid($value)
    {
        return $this->set(self::AT_UID, $value);
    }

    /**
     * Returns value of 'at_uid' property
     *
     * @return string
     */
    public function getAtUid()
    {
        return $this->get(self::AT_UID);
    }

    /**
     * Sets value of 'at_nick_name' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setAtNickName($value)
    {
        return $this->set(self::AT_NICK_NAME, $value);
    }

    /**
     * Returns value of 'at_nick_name' property
     *
     * @return string
     */
    public function getAtNickName()
    {
        return $this->get(self::AT_NICK_NAME);
    }

    /**
     * Sets value of 'is_my' property
     *
     * @param bool $value Property value
     *
     * @return null
     */
    public function setIsMy($value)
    {
        return $this->set(self::IS_MY, $value);
    }

    /**
     * Returns value of 'is_my' property
     *
     * @return bool
     */
    public function getIsMy()
    {
        return $this->get(self::IS_MY);
    }
}
}

namespace  {
/**
 * ShareInfo message
 */
class ShareInfo extends \ProtobufMessage
{
    /* Field index constants */
    const SHARE_LINK = 1;
    const SHARE_ICO = 2;
    const SHARE_TITLE = 3;
    const SHARE_DESC = 4;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::SHARE_LINK => array(
            'name' => 'share_link',
            'required' => true,
            'type' => 7,
        ),
        self::SHARE_ICO => array(
            'name' => 'share_ico',
            'required' => true,
            'type' => 7,
        ),
        self::SHARE_TITLE => array(
            'name' => 'share_title',
            'required' => true,
            'type' => 7,
        ),
        self::SHARE_DESC => array(
            'name' => 'share_desc',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::SHARE_LINK] = null;
        $this->values[self::SHARE_ICO] = null;
        $this->values[self::SHARE_TITLE] = null;
        $this->values[self::SHARE_DESC] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'share_link' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setShareLink($value)
    {
        return $this->set(self::SHARE_LINK, $value);
    }

    /**
     * Returns value of 'share_link' property
     *
     * @return string
     */
    public function getShareLink()
    {
        return $this->get(self::SHARE_LINK);
    }

    /**
     * Sets value of 'share_ico' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setShareIco($value)
    {
        return $this->set(self::SHARE_ICO, $value);
    }

    /**
     * Returns value of 'share_ico' property
     *
     * @return string
     */
    public function getShareIco()
    {
        return $this->get(self::SHARE_ICO);
    }

    /**
     * Sets value of 'share_title' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setShareTitle($value)
    {
        return $this->set(self::SHARE_TITLE, $value);
    }

    /**
     * Returns value of 'share_title' property
     *
     * @return string
     */
    public function getShareTitle()
    {
        return $this->get(self::SHARE_TITLE);
    }

    /**
     * Sets value of 'share_desc' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setShareDesc($value)
    {
        return $this->set(self::SHARE_DESC, $value);
    }

    /**
     * Returns value of 'share_desc' property
     *
     * @return string
     */
    public function getShareDesc()
    {
        return $this->get(self::SHARE_DESC);
    }
}
}

namespace  {
/**
 * PostImg message
 */
class PostImg extends \ProtobufMessage
{
    /* Field index constants */
    const THUMB = 1;
    const PREVIEW = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::THUMB => array(
            'name' => 'thumb',
            'required' => true,
            'type' => 7,
        ),
        self::PREVIEW => array(
            'name' => 'preview',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::THUMB] = null;
        $this->values[self::PREVIEW] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'thumb' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setThumb($value)
    {
        return $this->set(self::THUMB, $value);
    }

    /**
     * Returns value of 'thumb' property
     *
     * @return string
     */
    public function getThumb()
    {
        return $this->get(self::THUMB);
    }

    /**
     * Sets value of 'preview' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPreview($value)
    {
        return $this->set(self::PREVIEW, $value);
    }

    /**
     * Returns value of 'preview' property
     *
     * @return string
     */
    public function getPreview()
    {
        return $this->get(self::PREVIEW);
    }
}
}

namespace  {
/**
 * UserInfoList message
 */
class UserInfoList extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_RESPONSE_INFO = 1;
    const USER_INFOS = 100;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_RESPONSE_INFO => array(
            'name' => 'page_response_info',
            'required' => true,
            'type' => 'PageResponseInfo'
        ),
        self::USER_INFOS => array(
            'name' => 'user_infos',
            'repeated' => true,
            'type' => 'UserInfo'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_RESPONSE_INFO] = null;
        $this->values[self::USER_INFOS] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_response_info' property
     *
     * @param PageResponseInfo $value Property value
     *
     * @return null
     */
    public function setPageResponseInfo(PageResponseInfo $value)
    {
        return $this->set(self::PAGE_RESPONSE_INFO, $value);
    }

    /**
     * Returns value of 'page_response_info' property
     *
     * @return PageResponseInfo
     */
    public function getPageResponseInfo()
    {
        return $this->get(self::PAGE_RESPONSE_INFO);
    }

    /**
     * Appends value to 'user_infos' list
     *
     * @param UserInfo $value Value to append
     *
     * @return null
     */
    public function appendUserInfos(UserInfo $value)
    {
        return $this->append(self::USER_INFOS, $value);
    }

    /**
     * Clears 'user_infos' list
     *
     * @return null
     */
    public function clearUserInfos()
    {
        return $this->clear(self::USER_INFOS);
    }

    /**
     * Returns 'user_infos' list
     *
     * @return UserInfo[]
     */
    public function getUserInfos()
    {
        return $this->get(self::USER_INFOS);
    }

    /**
     * Returns 'user_infos' iterator
     *
     * @return ArrayIterator
     */
    public function getUserInfosIterator()
    {
        return new \ArrayIterator($this->get(self::USER_INFOS));
    }

    /**
     * Returns element from 'user_infos' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return UserInfo
     */
    public function getUserInfosAt($offset)
    {
        return $this->get(self::USER_INFOS, $offset);
    }

    /**
     * Returns count of 'user_infos' list
     *
     * @return int
     */
    public function getUserInfosCount()
    {
        return $this->count(self::USER_INFOS);
    }
}
}

namespace  {
/**
 * UserInfo message
 */
class UserInfo extends \ProtobufMessage
{
    /* Field index constants */
    const ID = 1;
    const HEAD_IMG_URL = 2;
    const NICK_NAME = 3;
    const SEX = 4;
    const AGE = 5;
    const WEIXIN = 6;
    const QQ = 7;
    const PHONE = 8;
    const IS_COMPLETE = 9;
    const VISIBLE_ITEM = 10;
    const GROUP_VISIBLE = 11;
    const HEAD_IMG_URL_ORIGIN = 12;
    const INTEGRITY = 13;
    const SELF_SIGN = 14;
    const WANNA_GO_DEST = 15;
    const HAVE_BEEN_DEST = 16;
    const TRAVEL_PEFER = 17;
    const RESIDENCE = 18;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::ID => array(
            'name' => 'id',
            'required' => true,
            'type' => 7,
        ),
        self::HEAD_IMG_URL => array(
            'name' => 'head_img_url',
            'required' => true,
            'type' => 7,
        ),
        self::NICK_NAME => array(
            'name' => 'nick_name',
            'required' => true,
            'type' => 7,
        ),
        self::SEX => array(
            'name' => 'sex',
            'required' => true,
            'type' => 5,
        ),
        self::AGE => array(
            'name' => 'age',
            'required' => true,
            'type' => 5,
        ),
        self::WEIXIN => array(
            'name' => 'weixin',
            'required' => true,
            'type' => 7,
        ),
        self::QQ => array(
            'name' => 'qq',
            'required' => true,
            'type' => 7,
        ),
        self::PHONE => array(
            'name' => 'phone',
            'required' => true,
            'type' => 7,
        ),
        self::IS_COMPLETE => array(
            'name' => 'is_complete',
            'required' => false,
            'type' => 8,
        ),
        self::VISIBLE_ITEM => array(
            'name' => 'visible_item',
            'required' => true,
            'type' => 5,
        ),
        self::GROUP_VISIBLE => array(
            'name' => 'group_visible',
            'required' => true,
            'type' => 8,
        ),
        self::HEAD_IMG_URL_ORIGIN => array(
            'name' => 'head_img_url_origin',
            'required' => true,
            'type' => 7,
        ),
        self::INTEGRITY => array(
            'name' => 'integrity',
            'required' => false,
            'type' => 5,
        ),
        self::SELF_SIGN => array(
            'name' => 'self_sign',
            'required' => false,
            'type' => 7,
        ),
        self::WANNA_GO_DEST => array(
            'name' => 'wanna_go_dest',
            'required' => false,
            'type' => 7,
        ),
        self::HAVE_BEEN_DEST => array(
            'name' => 'have_been_dest',
            'required' => false,
            'type' => 7,
        ),
        self::TRAVEL_PEFER => array(
            'name' => 'travel_pefer',
            'repeated' => true,
            'type' => 7,
        ),
        self::RESIDENCE => array(
            'name' => 'residence',
            'required' => false,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::ID] = null;
        $this->values[self::HEAD_IMG_URL] = null;
        $this->values[self::NICK_NAME] = null;
        $this->values[self::SEX] = null;
        $this->values[self::AGE] = null;
        $this->values[self::WEIXIN] = null;
        $this->values[self::QQ] = null;
        $this->values[self::PHONE] = null;
        $this->values[self::IS_COMPLETE] = null;
        $this->values[self::VISIBLE_ITEM] = null;
        $this->values[self::GROUP_VISIBLE] = null;
        $this->values[self::HEAD_IMG_URL_ORIGIN] = null;
        $this->values[self::INTEGRITY] = null;
        $this->values[self::SELF_SIGN] = null;
        $this->values[self::WANNA_GO_DEST] = null;
        $this->values[self::HAVE_BEEN_DEST] = null;
        $this->values[self::TRAVEL_PEFER] = array();
        $this->values[self::RESIDENCE] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setId($value)
    {
        return $this->set(self::ID, $value);
    }

    /**
     * Returns value of 'id' property
     *
     * @return string
     */
    public function getId()
    {
        return $this->get(self::ID);
    }

    /**
     * Sets value of 'head_img_url' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setHeadImgUrl($value)
    {
        return $this->set(self::HEAD_IMG_URL, $value);
    }

    /**
     * Returns value of 'head_img_url' property
     *
     * @return string
     */
    public function getHeadImgUrl()
    {
        return $this->get(self::HEAD_IMG_URL);
    }

    /**
     * Sets value of 'nick_name' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setNickName($value)
    {
        return $this->set(self::NICK_NAME, $value);
    }

    /**
     * Returns value of 'nick_name' property
     *
     * @return string
     */
    public function getNickName()
    {
        return $this->get(self::NICK_NAME);
    }

    /**
     * Sets value of 'sex' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setSex($value)
    {
        return $this->set(self::SEX, $value);
    }

    /**
     * Returns value of 'sex' property
     *
     * @return int
     */
    public function getSex()
    {
        return $this->get(self::SEX);
    }

    /**
     * Sets value of 'age' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setAge($value)
    {
        return $this->set(self::AGE, $value);
    }

    /**
     * Returns value of 'age' property
     *
     * @return int
     */
    public function getAge()
    {
        return $this->get(self::AGE);
    }

    /**
     * Sets value of 'weixin' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setWeixin($value)
    {
        return $this->set(self::WEIXIN, $value);
    }

    /**
     * Returns value of 'weixin' property
     *
     * @return string
     */
    public function getWeixin()
    {
        return $this->get(self::WEIXIN);
    }

    /**
     * Sets value of 'qq' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setQq($value)
    {
        return $this->set(self::QQ, $value);
    }

    /**
     * Returns value of 'qq' property
     *
     * @return string
     */
    public function getQq()
    {
        return $this->get(self::QQ);
    }

    /**
     * Sets value of 'phone' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPhone($value)
    {
        return $this->set(self::PHONE, $value);
    }

    /**
     * Returns value of 'phone' property
     *
     * @return string
     */
    public function getPhone()
    {
        return $this->get(self::PHONE);
    }

    /**
     * Sets value of 'is_complete' property
     *
     * @param bool $value Property value
     *
     * @return null
     */
    public function setIsComplete($value)
    {
        return $this->set(self::IS_COMPLETE, $value);
    }

    /**
     * Returns value of 'is_complete' property
     *
     * @return bool
     */
    public function getIsComplete()
    {
        return $this->get(self::IS_COMPLETE);
    }

    /**
     * Sets value of 'visible_item' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setVisibleItem($value)
    {
        return $this->set(self::VISIBLE_ITEM, $value);
    }

    /**
     * Returns value of 'visible_item' property
     *
     * @return int
     */
    public function getVisibleItem()
    {
        return $this->get(self::VISIBLE_ITEM);
    }

    /**
     * Sets value of 'group_visible' property
     *
     * @param bool $value Property value
     *
     * @return null
     */
    public function setGroupVisible($value)
    {
        return $this->set(self::GROUP_VISIBLE, $value);
    }

    /**
     * Returns value of 'group_visible' property
     *
     * @return bool
     */
    public function getGroupVisible()
    {
        return $this->get(self::GROUP_VISIBLE);
    }

    /**
     * Sets value of 'head_img_url_origin' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setHeadImgUrlOrigin($value)
    {
        return $this->set(self::HEAD_IMG_URL_ORIGIN, $value);
    }

    /**
     * Returns value of 'head_img_url_origin' property
     *
     * @return string
     */
    public function getHeadImgUrlOrigin()
    {
        return $this->get(self::HEAD_IMG_URL_ORIGIN);
    }

    /**
     * Sets value of 'integrity' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setIntegrity($value)
    {
        return $this->set(self::INTEGRITY, $value);
    }

    /**
     * Returns value of 'integrity' property
     *
     * @return int
     */
    public function getIntegrity()
    {
        return $this->get(self::INTEGRITY);
    }

    /**
     * Sets value of 'self_sign' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setSelfSign($value)
    {
        return $this->set(self::SELF_SIGN, $value);
    }

    /**
     * Returns value of 'self_sign' property
     *
     * @return string
     */
    public function getSelfSign()
    {
        return $this->get(self::SELF_SIGN);
    }

    /**
     * Sets value of 'wanna_go_dest' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setWannaGoDest($value)
    {
        return $this->set(self::WANNA_GO_DEST, $value);
    }

    /**
     * Returns value of 'wanna_go_dest' property
     *
     * @return string
     */
    public function getWannaGoDest()
    {
        return $this->get(self::WANNA_GO_DEST);
    }

    /**
     * Sets value of 'have_been_dest' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setHaveBeenDest($value)
    {
        return $this->set(self::HAVE_BEEN_DEST, $value);
    }

    /**
     * Returns value of 'have_been_dest' property
     *
     * @return string
     */
    public function getHaveBeenDest()
    {
        return $this->get(self::HAVE_BEEN_DEST);
    }

    /**
     * Appends value to 'travel_pefer' list
     *
     * @param string $value Value to append
     *
     * @return null
     */
    public function appendTravelPefer($value)
    {
        return $this->append(self::TRAVEL_PEFER, $value);
    }

    /**
     * Clears 'travel_pefer' list
     *
     * @return null
     */
    public function clearTravelPefer()
    {
        return $this->clear(self::TRAVEL_PEFER);
    }

    /**
     * Returns 'travel_pefer' list
     *
     * @return string[]
     */
    public function getTravelPefer()
    {
        return $this->get(self::TRAVEL_PEFER);
    }

    /**
     * Returns 'travel_pefer' iterator
     *
     * @return ArrayIterator
     */
    public function getTravelPeferIterator()
    {
        return new \ArrayIterator($this->get(self::TRAVEL_PEFER));
    }

    /**
     * Returns element from 'travel_pefer' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return string
     */
    public function getTravelPeferAt($offset)
    {
        return $this->get(self::TRAVEL_PEFER, $offset);
    }

    /**
     * Returns count of 'travel_pefer' list
     *
     * @return int
     */
    public function getTravelPeferCount()
    {
        return $this->count(self::TRAVEL_PEFER);
    }

    /**
     * Sets value of 'residence' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setResidence($value)
    {
        return $this->set(self::RESIDENCE, $value);
    }

    /**
     * Returns value of 'residence' property
     *
     * @return string
     */
    public function getResidence()
    {
        return $this->get(self::RESIDENCE);
    }
}
}

namespace  {
/**
 * ClientUpdateInfo message
 */
class ClientUpdateInfo extends \ProtobufMessage
{
    /* Field index constants */
    const NEED_UPDATE = 1;
    const LATEST_VERSION_NAME = 2;
    const LATEST_VERSION_URL = 3;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::NEED_UPDATE => array(
            'name' => 'need_update',
            'required' => true,
            'type' => 8,
        ),
        self::LATEST_VERSION_NAME => array(
            'name' => 'latest_version_name',
            'required' => false,
            'type' => 7,
        ),
        self::LATEST_VERSION_URL => array(
            'name' => 'latest_version_url',
            'required' => false,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::NEED_UPDATE] = null;
        $this->values[self::LATEST_VERSION_NAME] = null;
        $this->values[self::LATEST_VERSION_URL] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'need_update' property
     *
     * @param bool $value Property value
     *
     * @return null
     */
    public function setNeedUpdate($value)
    {
        return $this->set(self::NEED_UPDATE, $value);
    }

    /**
     * Returns value of 'need_update' property
     *
     * @return bool
     */
    public function getNeedUpdate()
    {
        return $this->get(self::NEED_UPDATE);
    }

    /**
     * Sets value of 'latest_version_name' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setLatestVersionName($value)
    {
        return $this->set(self::LATEST_VERSION_NAME, $value);
    }

    /**
     * Returns value of 'latest_version_name' property
     *
     * @return string
     */
    public function getLatestVersionName()
    {
        return $this->get(self::LATEST_VERSION_NAME);
    }

    /**
     * Sets value of 'latest_version_url' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setLatestVersionUrl($value)
    {
        return $this->set(self::LATEST_VERSION_URL, $value);
    }

    /**
     * Returns value of 'latest_version_url' property
     *
     * @return string
     */
    public function getLatestVersionUrl()
    {
        return $this->get(self::LATEST_VERSION_URL);
    }
}
}

namespace  {
/**
 * LikedMessageList message
 */
class LikedMessageList extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_RESPONSE_INFO = 1;
    const LIKED_MESSAGE = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_RESPONSE_INFO => array(
            'name' => 'page_response_info',
            'required' => true,
            'type' => 'PageResponseInfo'
        ),
        self::LIKED_MESSAGE => array(
            'name' => 'liked_message',
            'repeated' => true,
            'type' => 'LikedMessage'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_RESPONSE_INFO] = null;
        $this->values[self::LIKED_MESSAGE] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_response_info' property
     *
     * @param PageResponseInfo $value Property value
     *
     * @return null
     */
    public function setPageResponseInfo(PageResponseInfo $value)
    {
        return $this->set(self::PAGE_RESPONSE_INFO, $value);
    }

    /**
     * Returns value of 'page_response_info' property
     *
     * @return PageResponseInfo
     */
    public function getPageResponseInfo()
    {
        return $this->get(self::PAGE_RESPONSE_INFO);
    }

    /**
     * Appends value to 'liked_message' list
     *
     * @param LikedMessage $value Value to append
     *
     * @return null
     */
    public function appendLikedMessage(LikedMessage $value)
    {
        return $this->append(self::LIKED_MESSAGE, $value);
    }

    /**
     * Clears 'liked_message' list
     *
     * @return null
     */
    public function clearLikedMessage()
    {
        return $this->clear(self::LIKED_MESSAGE);
    }

    /**
     * Returns 'liked_message' list
     *
     * @return LikedMessage[]
     */
    public function getLikedMessage()
    {
        return $this->get(self::LIKED_MESSAGE);
    }

    /**
     * Returns 'liked_message' iterator
     *
     * @return ArrayIterator
     */
    public function getLikedMessageIterator()
    {
        return new \ArrayIterator($this->get(self::LIKED_MESSAGE));
    }

    /**
     * Returns element from 'liked_message' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return LikedMessage
     */
    public function getLikedMessageAt($offset)
    {
        return $this->get(self::LIKED_MESSAGE, $offset);
    }

    /**
     * Returns count of 'liked_message' list
     *
     * @return int
     */
    public function getLikedMessageCount()
    {
        return $this->count(self::LIKED_MESSAGE);
    }
}
}

namespace  {
/**
 * LikedMessage message
 */
class LikedMessage extends \ProtobufMessage
{
    /* Field index constants */
    const ID = 1;
    const USER_INFO = 2;
    const DEST = 3;
    const IS_READ = 4;
    const CREATED_AT = 5;
    const POST_ID = 6;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::ID => array(
            'name' => 'id',
            'required' => true,
            'type' => 7,
        ),
        self::USER_INFO => array(
            'name' => 'user_info',
            'required' => true,
            'type' => 'UserInfo'
        ),
        self::DEST => array(
            'name' => 'dest',
            'required' => true,
            'type' => 7,
        ),
        self::IS_READ => array(
            'name' => 'is_read',
            'required' => true,
            'type' => 5,
        ),
        self::CREATED_AT => array(
            'name' => 'created_at',
            'required' => true,
            'type' => 7,
        ),
        self::POST_ID => array(
            'name' => 'post_id',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::ID] = null;
        $this->values[self::USER_INFO] = null;
        $this->values[self::DEST] = null;
        $this->values[self::IS_READ] = null;
        $this->values[self::CREATED_AT] = null;
        $this->values[self::POST_ID] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setId($value)
    {
        return $this->set(self::ID, $value);
    }

    /**
     * Returns value of 'id' property
     *
     * @return string
     */
    public function getId()
    {
        return $this->get(self::ID);
    }

    /**
     * Sets value of 'user_info' property
     *
     * @param UserInfo $value Property value
     *
     * @return null
     */
    public function setUserInfo(UserInfo $value)
    {
        return $this->set(self::USER_INFO, $value);
    }

    /**
     * Returns value of 'user_info' property
     *
     * @return UserInfo
     */
    public function getUserInfo()
    {
        return $this->get(self::USER_INFO);
    }

    /**
     * Sets value of 'dest' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setDest($value)
    {
        return $this->set(self::DEST, $value);
    }

    /**
     * Returns value of 'dest' property
     *
     * @return string
     */
    public function getDest()
    {
        return $this->get(self::DEST);
    }

    /**
     * Sets value of 'is_read' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setIsRead($value)
    {
        return $this->set(self::IS_READ, $value);
    }

    /**
     * Returns value of 'is_read' property
     *
     * @return int
     */
    public function getIsRead()
    {
        return $this->get(self::IS_READ);
    }

    /**
     * Sets value of 'created_at' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setCreatedAt($value)
    {
        return $this->set(self::CREATED_AT, $value);
    }

    /**
     * Returns value of 'created_at' property
     *
     * @return string
     */
    public function getCreatedAt()
    {
        return $this->get(self::CREATED_AT);
    }

    /**
     * Sets value of 'post_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostId($value)
    {
        return $this->set(self::POST_ID, $value);
    }

    /**
     * Returns value of 'post_id' property
     *
     * @return string
     */
    public function getPostId()
    {
        return $this->get(self::POST_ID);
    }
}
}

namespace  {
/**
 * CommentMessage message
 */
class CommentMessage extends \ProtobufMessage
{
    /* Field index constants */
    const ID = 1;
    const USER_INFO = 2;
    const DEST = 3;
    const IS_READ = 4;
    const CREATED_AT = 5;
    const POST_ID = 6;
    const CONTENT = 7;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::ID => array(
            'name' => 'id',
            'required' => true,
            'type' => 7,
        ),
        self::USER_INFO => array(
            'name' => 'user_info',
            'required' => true,
            'type' => 'UserInfo'
        ),
        self::DEST => array(
            'name' => 'dest',
            'required' => true,
            'type' => 7,
        ),
        self::IS_READ => array(
            'name' => 'is_read',
            'required' => true,
            'type' => 5,
        ),
        self::CREATED_AT => array(
            'name' => 'created_at',
            'required' => true,
            'type' => 7,
        ),
        self::POST_ID => array(
            'name' => 'post_id',
            'required' => true,
            'type' => 7,
        ),
        self::CONTENT => array(
            'name' => 'content',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::ID] = null;
        $this->values[self::USER_INFO] = null;
        $this->values[self::DEST] = null;
        $this->values[self::IS_READ] = null;
        $this->values[self::CREATED_AT] = null;
        $this->values[self::POST_ID] = null;
        $this->values[self::CONTENT] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setId($value)
    {
        return $this->set(self::ID, $value);
    }

    /**
     * Returns value of 'id' property
     *
     * @return string
     */
    public function getId()
    {
        return $this->get(self::ID);
    }

    /**
     * Sets value of 'user_info' property
     *
     * @param UserInfo $value Property value
     *
     * @return null
     */
    public function setUserInfo(UserInfo $value)
    {
        return $this->set(self::USER_INFO, $value);
    }

    /**
     * Returns value of 'user_info' property
     *
     * @return UserInfo
     */
    public function getUserInfo()
    {
        return $this->get(self::USER_INFO);
    }

    /**
     * Sets value of 'dest' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setDest($value)
    {
        return $this->set(self::DEST, $value);
    }

    /**
     * Returns value of 'dest' property
     *
     * @return string
     */
    public function getDest()
    {
        return $this->get(self::DEST);
    }

    /**
     * Sets value of 'is_read' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setIsRead($value)
    {
        return $this->set(self::IS_READ, $value);
    }

    /**
     * Returns value of 'is_read' property
     *
     * @return int
     */
    public function getIsRead()
    {
        return $this->get(self::IS_READ);
    }

    /**
     * Sets value of 'created_at' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setCreatedAt($value)
    {
        return $this->set(self::CREATED_AT, $value);
    }

    /**
     * Returns value of 'created_at' property
     *
     * @return string
     */
    public function getCreatedAt()
    {
        return $this->get(self::CREATED_AT);
    }

    /**
     * Sets value of 'post_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setPostId($value)
    {
        return $this->set(self::POST_ID, $value);
    }

    /**
     * Returns value of 'post_id' property
     *
     * @return string
     */
    public function getPostId()
    {
        return $this->get(self::POST_ID);
    }

    /**
     * Sets value of 'content' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setContent($value)
    {
        return $this->set(self::CONTENT, $value);
    }

    /**
     * Returns value of 'content' property
     *
     * @return string
     */
    public function getContent()
    {
        return $this->get(self::CONTENT);
    }
}
}

namespace  {
/**
 * CommonMessage message
 */
class CommonMessage extends \ProtobufMessage
{
    /* Field index constants */
    const COMMON_ID = 1;
    const TYPE = 2;
    const LIKED_MESSAGE = 3;
    const COMMENT_MESSAGE = 4;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::COMMON_ID => array(
            'name' => 'common_id',
            'required' => true,
            'type' => 7,
        ),
        self::TYPE => array(
            'name' => 'type',
            'required' => true,
            'type' => 5,
        ),
        self::LIKED_MESSAGE => array(
            'name' => 'liked_message',
            'required' => false,
            'type' => 'LikedMessage'
        ),
        self::COMMENT_MESSAGE => array(
            'name' => 'comment_message',
            'required' => false,
            'type' => 'CommentMessage'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::COMMON_ID] = null;
        $this->values[self::TYPE] = null;
        $this->values[self::LIKED_MESSAGE] = null;
        $this->values[self::COMMENT_MESSAGE] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'common_id' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setCommonId($value)
    {
        return $this->set(self::COMMON_ID, $value);
    }

    /**
     * Returns value of 'common_id' property
     *
     * @return string
     */
    public function getCommonId()
    {
        return $this->get(self::COMMON_ID);
    }

    /**
     * Sets value of 'type' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setType($value)
    {
        return $this->set(self::TYPE, $value);
    }

    /**
     * Returns value of 'type' property
     *
     * @return int
     */
    public function getType()
    {
        return $this->get(self::TYPE);
    }

    /**
     * Sets value of 'liked_message' property
     *
     * @param LikedMessage $value Property value
     *
     * @return null
     */
    public function setLikedMessage(LikedMessage $value)
    {
        return $this->set(self::LIKED_MESSAGE, $value);
    }

    /**
     * Returns value of 'liked_message' property
     *
     * @return LikedMessage
     */
    public function getLikedMessage()
    {
        return $this->get(self::LIKED_MESSAGE);
    }

    /**
     * Sets value of 'comment_message' property
     *
     * @param CommentMessage $value Property value
     *
     * @return null
     */
    public function setCommentMessage(CommentMessage $value)
    {
        return $this->set(self::COMMENT_MESSAGE, $value);
    }

    /**
     * Returns value of 'comment_message' property
     *
     * @return CommentMessage
     */
    public function getCommentMessage()
    {
        return $this->get(self::COMMENT_MESSAGE);
    }
}
}

namespace  {
/**
 * CommonMessageList message
 */
class CommonMessageList extends \ProtobufMessage
{
    /* Field index constants */
    const PAGE_RESPONSE_INFO = 1;
    const COMMON_MESSAGE = 100;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::PAGE_RESPONSE_INFO => array(
            'name' => 'page_response_info',
            'required' => true,
            'type' => 'PageResponseInfo'
        ),
        self::COMMON_MESSAGE => array(
            'name' => 'common_message',
            'repeated' => true,
            'type' => 'CommonMessage'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::PAGE_RESPONSE_INFO] = null;
        $this->values[self::COMMON_MESSAGE] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'page_response_info' property
     *
     * @param PageResponseInfo $value Property value
     *
     * @return null
     */
    public function setPageResponseInfo(PageResponseInfo $value)
    {
        return $this->set(self::PAGE_RESPONSE_INFO, $value);
    }

    /**
     * Returns value of 'page_response_info' property
     *
     * @return PageResponseInfo
     */
    public function getPageResponseInfo()
    {
        return $this->get(self::PAGE_RESPONSE_INFO);
    }

    /**
     * Appends value to 'common_message' list
     *
     * @param CommonMessage $value Value to append
     *
     * @return null
     */
    public function appendCommonMessage(CommonMessage $value)
    {
        return $this->append(self::COMMON_MESSAGE, $value);
    }

    /**
     * Clears 'common_message' list
     *
     * @return null
     */
    public function clearCommonMessage()
    {
        return $this->clear(self::COMMON_MESSAGE);
    }

    /**
     * Returns 'common_message' list
     *
     * @return CommonMessage[]
     */
    public function getCommonMessage()
    {
        return $this->get(self::COMMON_MESSAGE);
    }

    /**
     * Returns 'common_message' iterator
     *
     * @return ArrayIterator
     */
    public function getCommonMessageIterator()
    {
        return new \ArrayIterator($this->get(self::COMMON_MESSAGE));
    }

    /**
     * Returns element from 'common_message' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return CommonMessage
     */
    public function getCommonMessageAt($offset)
    {
        return $this->get(self::COMMON_MESSAGE, $offset);
    }

    /**
     * Returns count of 'common_message' list
     *
     * @return int
     */
    public function getCommonMessageCount()
    {
        return $this->count(self::COMMON_MESSAGE);
    }
}
}

namespace  {
/**
 * WannaJoinResponse message
 */
class WannaJoinResponse extends \ProtobufMessage
{
    /* Field index constants */
    const WANNA_JOIN_NUM = 1;
    const WANNA_JOIN_STATE = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::WANNA_JOIN_NUM => array(
            'name' => 'wanna_join_num',
            'required' => true,
            'type' => 5,
        ),
        self::WANNA_JOIN_STATE => array(
            'name' => 'wanna_join_state',
            'required' => true,
            'type' => 5,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::WANNA_JOIN_NUM] = null;
        $this->values[self::WANNA_JOIN_STATE] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'wanna_join_num' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setWannaJoinNum($value)
    {
        return $this->set(self::WANNA_JOIN_NUM, $value);
    }

    /**
     * Returns value of 'wanna_join_num' property
     *
     * @return int
     */
    public function getWannaJoinNum()
    {
        return $this->get(self::WANNA_JOIN_NUM);
    }

    /**
     * Sets value of 'wanna_join_state' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setWannaJoinState($value)
    {
        return $this->set(self::WANNA_JOIN_STATE, $value);
    }

    /**
     * Returns value of 'wanna_join_state' property
     *
     * @return int
     */
    public function getWannaJoinState()
    {
        return $this->get(self::WANNA_JOIN_STATE);
    }
}
}

namespace  {
/**
 * PageResponseInfo message
 */
class PageResponseInfo extends \ProtobufMessage
{
    /* Field index constants */
    const HAS_REST = 1;
    const END_OFFSET = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::HAS_REST => array(
            'name' => 'has_rest',
            'required' => true,
            'type' => 8,
        ),
        self::END_OFFSET => array(
            'name' => 'end_offset',
            'required' => true,
            'type' => 5,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::HAS_REST] = null;
        $this->values[self::END_OFFSET] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'has_rest' property
     *
     * @param bool $value Property value
     *
     * @return null
     */
    public function setHasRest($value)
    {
        return $this->set(self::HAS_REST, $value);
    }

    /**
     * Returns value of 'has_rest' property
     *
     * @return bool
     */
    public function getHasRest()
    {
        return $this->get(self::HAS_REST);
    }

    /**
     * Sets value of 'end_offset' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setEndOffset($value)
    {
        return $this->set(self::END_OFFSET, $value);
    }

    /**
     * Returns value of 'end_offset' property
     *
     * @return int
     */
    public function getEndOffset()
    {
        return $this->get(self::END_OFFSET);
    }
}
}

namespace  {
/**
 * DataUpdateResponseInfo message
 */
class DataUpdateResponseInfo extends \ProtobufMessage
{
    /* Field index constants */
    const UPDATE_DATA = 1;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::UPDATE_DATA => array(
            'name' => 'update_data',
            'repeated' => true,
            'type' => 'UpdateData'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::UPDATE_DATA] = array();
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Appends value to 'update_data' list
     *
     * @param UpdateData $value Value to append
     *
     * @return null
     */
    public function appendUpdateData(UpdateData $value)
    {
        return $this->append(self::UPDATE_DATA, $value);
    }

    /**
     * Clears 'update_data' list
     *
     * @return null
     */
    public function clearUpdateData()
    {
        return $this->clear(self::UPDATE_DATA);
    }

    /**
     * Returns 'update_data' list
     *
     * @return UpdateData[]
     */
    public function getUpdateData()
    {
        return $this->get(self::UPDATE_DATA);
    }

    /**
     * Returns 'update_data' iterator
     *
     * @return ArrayIterator
     */
    public function getUpdateDataIterator()
    {
        return new \ArrayIterator($this->get(self::UPDATE_DATA));
    }

    /**
     * Returns element from 'update_data' list at given offset
     *
     * @param int $offset Position in list
     *
     * @return UpdateData
     */
    public function getUpdateDataAt($offset)
    {
        return $this->get(self::UPDATE_DATA, $offset);
    }

    /**
     * Returns count of 'update_data' list
     *
     * @return int
     */
    public function getUpdateDataCount()
    {
        return $this->count(self::UPDATE_DATA);
    }
}
}

namespace  {
/**
 * UpdateData message
 */
class UpdateData extends \ProtobufMessage
{
    /* Field index constants */
    const FILE_NAME = 1;
    const URL = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::FILE_NAME => array(
            'name' => 'file_name',
            'required' => true,
            'type' => 7,
        ),
        self::URL => array(
            'name' => 'url',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::FILE_NAME] = null;
        $this->values[self::URL] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'file_name' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setFileName($value)
    {
        return $this->set(self::FILE_NAME, $value);
    }

    /**
     * Returns value of 'file_name' property
     *
     * @return string
     */
    public function getFileName()
    {
        return $this->get(self::FILE_NAME);
    }

    /**
     * Sets value of 'url' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setUrl($value)
    {
        return $this->set(self::URL, $value);
    }

    /**
     * Returns value of 'url' property
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->get(self::URL);
    }
}
}

namespace  {
/**
 * PostOverview message
 */
class PostOverview extends \ProtobufMessage
{
    /* Field index constants */
    const TOTAL_NUM = 1;
    const LATEST_POST = 2;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::TOTAL_NUM => array(
            'name' => 'total_num',
            'required' => true,
            'type' => 5,
        ),
        self::LATEST_POST => array(
            'name' => 'latest_post',
            'required' => false,
            'type' => 'PostResponseInfo'
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::TOTAL_NUM] = null;
        $this->values[self::LATEST_POST] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'total_num' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setTotalNum($value)
    {
        return $this->set(self::TOTAL_NUM, $value);
    }

    /**
     * Returns value of 'total_num' property
     *
     * @return int
     */
    public function getTotalNum()
    {
        return $this->get(self::TOTAL_NUM);
    }

    /**
     * Sets value of 'latest_post' property
     *
     * @param PostResponseInfo $value Property value
     *
     * @return null
     */
    public function setLatestPost(PostResponseInfo $value)
    {
        return $this->set(self::LATEST_POST, $value);
    }

    /**
     * Returns value of 'latest_post' property
     *
     * @return PostResponseInfo
     */
    public function getLatestPost()
    {
        return $this->get(self::LATEST_POST);
    }
}
}

namespace  {
/**
 * PushMessage message
 */
class PushMessage extends \ProtobufMessage
{
    /* Field index constants */
    const TYPE = 1;
    const TITLE = 2;
    const CONTENT = 3;

    /* @var array Field descriptors */
    protected static $fields = array(
        self::TYPE => array(
            'name' => 'type',
            'required' => true,
            'type' => 5,
        ),
        self::TITLE => array(
            'name' => 'title',
            'required' => true,
            'type' => 7,
        ),
        self::CONTENT => array(
            'name' => 'content',
            'required' => true,
            'type' => 7,
        ),
    );

    /**
     * Constructs new message container and clears its internal state
     *
     * @return null
     */
    public function __construct()
    {
        $this->reset();
    }

    /**
     * Clears message values and sets default ones
     *
     * @return null
     */
    public function reset()
    {
        $this->values[self::TYPE] = null;
        $this->values[self::TITLE] = null;
        $this->values[self::CONTENT] = null;
    }

    /**
     * Returns field descriptors
     *
     * @return array
     */
    public function fields()
    {
        return self::$fields;
    }

    /**
     * Sets value of 'type' property
     *
     * @param int $value Property value
     *
     * @return null
     */
    public function setType($value)
    {
        return $this->set(self::TYPE, $value);
    }

    /**
     * Returns value of 'type' property
     *
     * @return int
     */
    public function getType()
    {
        return $this->get(self::TYPE);
    }

    /**
     * Sets value of 'title' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setTitle($value)
    {
        return $this->set(self::TITLE, $value);
    }

    /**
     * Returns value of 'title' property
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->get(self::TITLE);
    }

    /**
     * Sets value of 'content' property
     *
     * @param string $value Property value
     *
     * @return null
     */
    public function setContent($value)
    {
        return $this->set(self::CONTENT, $value);
    }

    /**
     * Returns value of 'content' property
     *
     * @return string
     */
    public function getContent()
    {
        return $this->get(self::CONTENT);
    }
}
}
